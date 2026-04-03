"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ConversationHistoryCard } from "@/components/conversation-history-card";
import { Chatroom, type ChatPartner } from "@/components/chatroom";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/context/AuthContext";
import { fetchSellerProfile } from "@/lib/listings";
import { MessagingClient, fetchMessagingConfig, type Room, type Message } from "@/lib/messaging";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MessagingPage() {
  return (
    <Suspense>
      <MessagingContent />
    </Suspense>
  );
}

function MessagingContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const clientRef = useRef<MessagingClient | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>({});
  const [senderDisplayName, setSenderDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  const userSub = user?.sub ?? "";
  const userId = user?.username ?? "";

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/messaging");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    document.title = "Messages - VAULT OF CARDS";
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchSellerProfile(userId).then((profile) => {
      setSenderDisplayName(profile?.displayName || userId);
    }).catch(() => {
      setSenderDisplayName(userId);
    });
  }, [userId]);

  // Initialize client, connect socket, fetch rooms
  useEffect(() => {
    if (!userSub) return;

    const client = new MessagingClient();
    clientRef.current = client;

    let cancelled = false;
    const unsubs: (() => void)[] = [];

    (async () => {
      try {
        const [{ getAccessToken: getToken }, config] = await Promise.all([
          import("@/lib/cognito"),
          fetchMessagingConfig(),
        ]);
        const accessToken = await getToken();
        if (!accessToken || cancelled) { setLoading(false); return; }

        console.log("[messaging] initializing socket...");
        client.init(accessToken, config.messagingApi);

        // Attach listeners BEFORE connect so no events are missed
        unsubs.push(client.onNewMessage((msg) => {
          console.log("[messaging] ws message:new", msg.messageId, msg.conversationId);
          setMessagesByConversation((prev) => ({
            ...prev,
            [msg.conversationId]: [...(prev[msg.conversationId] ?? []), msg],
          }));
          setRooms((prev) => {
            const idx = prev.findIndex((r) => r.conversationId === msg.conversationId);
            if (idx >= 0) {
              const updated = { ...prev[idx], latestMessage: msg.content, latestMessageSenderId: msg.senderId, updatedAt: msg.createdAt };
              const next = [...prev];
              next.splice(idx, 1);
              return [updated, ...next];
            }
            // New room — re-fetch rooms list
            console.log("[messaging] new room detected, re-fetching rooms...");
            client.fetchRooms().then((freshRooms) => {
              setRooms(freshRooms);
            }).catch((err) => console.error("[messaging] re-fetch rooms failed:", err));
            return prev;
          });
        }));

        unsubs.push(client.onMessageUpdated((msg) => {
          console.log("[messaging] ws message:updated", msg.messageId);
          setMessagesByConversation((prev) => {
            const messages = prev[msg.conversationId];
            if (!messages) return prev;
            return { ...prev, [msg.conversationId]: messages.map((m) => m.messageId === msg.messageId ? msg : m) };
          });
        }));

        unsubs.push(client.onMessageDeleted((data) => {
          console.log("[messaging] ws message:deleted", data.messageId);
          setMessagesByConversation((prev) => {
            const messages = prev[data.conversationId];
            if (!messages) return prev;
            return { ...prev, [data.conversationId]: messages.filter((m) => m.messageId !== data.messageId) };
          });
        }));

        unsubs.push(client.onDisconnect((reason) => {
          console.warn("[messaging] socket disconnected:", reason);
        }));

        // Now connect
        console.log("[messaging] connecting...");
        await client.connect();
        console.log("[messaging] socket connected");

        // Fetch rooms
        console.log("[messaging] fetching rooms...");
        const fetchedRooms = await client.fetchRooms();
        console.log("[messaging] fetched rooms:", fetchedRooms.length);
        if (cancelled) return;
        setRooms(fetchedRooms);
      } catch (err) {
        console.error("[messaging] init failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubs.forEach((fn) => fn());
      client.disconnect();
      console.log("[messaging] cleanup complete");
      clientRef.current = null;
    };
  }, [userSub]);

  // Fetch messages when selecting a conversation
  useEffect(() => {
    if (!selectedConversationId || !clientRef.current) return;

    const client = clientRef.current;
    let cancelled = false;

    (async () => {
      try {
        console.log("[messaging] joining room:", selectedConversationId);
        client.joinRoom(selectedConversationId);

        console.log("[messaging] fetching messages for:", selectedConversationId);
        const res = await client.fetchMessages(selectedConversationId);
        console.log("[messaging] fetched messages:", res.data.length);
        if (cancelled) return;
        setMessagesByConversation((prev) => ({
          ...prev,
          [selectedConversationId]: res.data,
        }));
      } catch (err) {
        console.error("[messaging] fetch messages failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId]);

  const selectedRoom = rooms.find((r) => r.conversationId === selectedConversationId);
  const conversationMessages = selectedConversationId
    ? messagesByConversation[selectedConversationId] ?? []
    : [];

  const handleSend = useCallback((text: string) => {
    if (!selectedConversationId || !clientRef.current) return;

    const room = rooms.find((r) => r.conversationId === selectedConversationId);
    if (!room) return;

    console.log("[messaging] sending message to:", room.recipientId);
    clientRef.current.sendMessage({
      recipientId: room.recipientId,
      content: text,
      messageType: "text",
    }).catch((err) => console.error("[messaging] send failed:", err));
  }, [selectedConversationId, rooms]);

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  const showConversationList = !selectedConversationId;

  const partner: ChatPartner | null = selectedRoom
    ? { id: selectedRoom.conversationId, name: selectedRoom.recipientName || selectedRoom.recipientId }
    : null;

  if (loading) {
    return (
      <div className="flex flex-1 flex-col w-full animate-[fade-up_0.4s_ease-out_both]">
        <PageHeader title="Messages" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col w-full animate-[fade-up_0.4s_ease-out_both] overflow-hidden max-h-[calc(100vh-4rem)]">
      <PageHeader title="Messages" />

      <div className="flex flex-1 gap-8 sm:gap-10 min-h-0">
        {/* Conversation list */}
        <div className={cn(
          "w-full sm:w-60 md:w-72 lg:w-80 shrink-0 overflow-y-auto min-h-0 space-y-1",
          showConversationList ? "block" : "hidden sm:block"
        )}>
          {rooms.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No conversations yet</p>
          ) : (
            rooms.map((room) => (
              <ConversationHistoryCard
                key={room.conversationId}
                room={room}
                currentUserId={userSub}
                partnerName={room.recipientName || room.recipientId}
                isSelected={room.conversationId === selectedConversationId}
                onSelect={() => handleSelectConversation(room.conversationId)}
              />
            ))
          )}
        </div>

        <div className="hidden sm:block w-px self-stretch bg-border" />

        {/* Chat panel */}
        <div className={cn(
          "flex-1 min-w-0 min-h-0 flex flex-col",
          selectedConversationId ? "flex" : "hidden sm:flex"
        )}>
          {partner ? (
            <>
              <div className="flex items-center gap-2 sm:hidden mb-3">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setSelectedConversationId(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">Back</span>
              </div>
              <Chatroom
                partner={partner}
                currentUserId={userSub}
                senderName={senderDisplayName}
                messages={conversationMessages}
                onSend={handleSend}
                className="flex-1 min-h-0"
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-xs text-muted-foreground">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
