"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  MessagingClient,
  fetchMessagingConfig,
  type Room,
  type Message,
  type DeleteMessageResponse,
} from "@/lib/messaging";

interface MessagingContextType {
  client: MessagingClient | null;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  hasUnread: boolean;
  clearUnread: () => void;
  connected: boolean;
  onNewMessage: (handler: (msg: Message) => void) => () => void;
  onMessageUpdated: (handler: (msg: Message) => void) => () => void;
  onMessageDeleted: (handler: (data: DeleteMessageResponse) => void) => () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const clientRef = useRef<MessagingClient | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [connected, setConnected] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // External listener registries
  const newMessageHandlers = useRef<Set<(msg: Message) => void>>(new Set());
  const updatedHandlers = useRef<Set<(msg: Message) => void>>(new Set());
  const deletedHandlers = useRef<Set<(data: DeleteMessageResponse) => void>>(new Set());

  const userSub = user?.sub;

  useEffect(() => {
    if (!userSub) {
      setRooms([]);
      setConnected(false);
      return;
    }

    const client = new MessagingClient();
    clientRef.current = client;
    let cancelled = false;

    (async () => {
      try {
        const [{ getAccessToken }, config] = await Promise.all([
          import("@/lib/cognito"),
          fetchMessagingConfig(),
        ]);
        const token = await getAccessToken();
        if (!token || cancelled) return;

        client.init(token, config.messagingApi);

        // Internal listeners that update rooms state and fan out to external handlers
        client.onNewMessage((msg) => {
          if (msg.senderId !== userSub) {
            setHasUnread(true);
          }
          setRooms((prev) => {
            const idx = prev.findIndex((r) => r.conversationId === msg.conversationId);
            if (idx >= 0) {
              const updated = { ...prev[idx], latestMessage: msg.content, latestMessageSenderId: msg.senderId, updatedAt: msg.createdAt };
              const next = [...prev];
              next.splice(idx, 1);
              return [updated, ...next];
            }
            // New room — re-fetch
            client.fetchRooms().then((fresh) => { if (!cancelled) setRooms(fresh); }).catch(() => {});
            return prev;
          });
          newMessageHandlers.current.forEach((h) => h(msg));
        });

        client.onMessageUpdated((msg) => {
          updatedHandlers.current.forEach((h) => h(msg));
        });

        client.onMessageDeleted((data) => {
          deletedHandlers.current.forEach((h) => h(data));
        });

        client.onDisconnect(() => { if (!cancelled) setConnected(false); });

        await client.connect();
        if (cancelled) return;
        setConnected(true);

        const fetchedRooms = await client.fetchRooms();
        if (!cancelled) setRooms(fetchedRooms);
      } catch (err) {
        console.error("[MessagingContext] init failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      client.disconnect();
      clientRef.current = null;
      setConnected(false);
    };
  }, [userSub]);

  const onNewMessage = useCallback((handler: (msg: Message) => void) => {
    newMessageHandlers.current.add(handler);
    return () => { newMessageHandlers.current.delete(handler); };
  }, []);

  const onMessageUpdated = useCallback((handler: (msg: Message) => void) => {
    updatedHandlers.current.add(handler);
    return () => { updatedHandlers.current.delete(handler); };
  }, []);

  const onMessageDeleted = useCallback((handler: (data: DeleteMessageResponse) => void) => {
    deletedHandlers.current.add(handler);
    return () => { deletedHandlers.current.delete(handler); };
  }, []);

  const clearUnread = useCallback(() => { setHasUnread(false); }, []);

  return (
    <MessagingContext.Provider
      value={{
        client: clientRef.current,
        rooms,
        setRooms,
        hasUnread,
        clearUnread,
        connected,
        onNewMessage,
        onMessageUpdated,
        onMessageDeleted,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
}
