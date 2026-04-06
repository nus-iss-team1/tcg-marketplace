"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ConversationHistoryCard } from "@/components/conversation-history-card";
import { Chatroom, type ChatPartner } from "@/components/chatroom";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/context/AuthContext";
import { useMessaging } from "@/context/MessagingContext";
import { fetchSellerProfile, fetchProfileBySub } from "@/lib/listings";
import type { Message } from "@/lib/messaging";
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
  const { client, rooms, setRooms, clearUnread, onNewMessage, onMessageUpdated, onMessageDeleted, connected } = useMessaging();
  const router = useRouter();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>({});
  const [senderDisplayName, setSenderDisplayName] = useState("");
  const [partnerNames, setPartnerNames] = useState<Record<string, string>>({});

  const userSub = user?.sub ?? "";
  const userId = user?.username ?? "";

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/messaging");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    document.title = "Messages - VAULT OF CARDS";
    clearUnread();
  }, [clearUnread]);

  useEffect(() => {
    if (!userId) return;
    fetchSellerProfile(userId).then((profile) => {
      setSenderDisplayName(profile?.displayName || userId);
    }).catch(() => {
      setSenderDisplayName(userId);
    });
  }, [userId]);

  // Resolve partner display names for rooms missing recipientName
  useEffect(() => {
    const unresolvedIds = rooms
      .filter((r) => !r.recipientName)
      .map((r) => r.recipientId)
      .filter((id) => !partnerNames[id]);

    const uniqueIds = [...new Set(unresolvedIds)];
    if (uniqueIds.length === 0) return;

    let cancelled = false;
    Promise.all(
      uniqueIds.map((id) =>
        fetchProfileBySub(id)
          .then((p) => [id, p?.displayName || id] as const)
          .catch(() => [id, id] as const)
      )
    ).then((results) => {
      if (cancelled) return;
      setPartnerNames((prev) => {
        const next = { ...prev };
        for (const [id, name] of results) next[id] = name;
        return next;
      });
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  // Subscribe to message events from the shared context
  useEffect(() => {
    const unsubs = [
      onNewMessage((msg) => {
        setMessagesByConversation((prev) => ({
          ...prev,
          [msg.conversationId]: [...(prev[msg.conversationId] ?? []), msg],
        }));
        // Clear unread since user is on the messaging page
        clearUnread();
      }),
      onMessageUpdated((msg) => {
        setMessagesByConversation((prev) => {
          const messages = prev[msg.conversationId];
          if (!messages) return prev;
          return { ...prev, [msg.conversationId]: messages.map((m) => m.messageId === msg.messageId ? msg : m) };
        });
      }),
      onMessageDeleted((data) => {
        setMessagesByConversation((prev) => {
          const messages = prev[data.conversationId];
          if (!messages) return prev;
          return { ...prev, [data.conversationId]: messages.filter((m) => m.messageId !== data.messageId) };
        });
      }),
    ];

    return () => { unsubs.forEach((fn) => fn()); };
  }, [onNewMessage, onMessageUpdated, onMessageDeleted, clearUnread]);

  // Fetch messages when selecting a conversation
  useEffect(() => {
    if (!selectedConversationId || !client) return;

    let cancelled = false;

    (async () => {
      try {
        client.joinRoom(selectedConversationId);

        const [messagesRes, freshRoom] = await Promise.all([
          client.fetchMessages(selectedConversationId),
          client.fetchRoom(selectedConversationId),
        ]);
        if (cancelled) return;
        setMessagesByConversation((prev) => ({
          ...prev,
          [selectedConversationId]: messagesRes.data,
        }));
        if (freshRoom) {
          setRooms((prev) => prev.map((r) => r.conversationId === selectedConversationId ? { ...r, listingId: freshRoom.listingId, listingGameName: freshRoom.listingGameName } : r));
        }
      } catch (err) {
        console.error("[messaging] fetch messages failed:", err);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedConversationId, client, setRooms]);

  const selectedRoom = rooms.find((r) => r.conversationId === selectedConversationId);
  const conversationMessages = selectedConversationId
    ? messagesByConversation[selectedConversationId] ?? []
    : [];

  const handleSend = useCallback((text: string) => {
    if (!selectedConversationId || !client) return;

    const room = rooms.find((r) => r.conversationId === selectedConversationId);
    if (!room) return;

    client.sendMessage({
      recipientId: room.recipientId,
      content: text,
      messageType: "text",
    }).catch((err) => console.error("[messaging] send failed:", err));
  }, [selectedConversationId, rooms, client]);

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  const showConversationList = !selectedConversationId;

  const partner: ChatPartner | null = selectedRoom
    ? { id: selectedRoom.conversationId, name: selectedRoom.recipientName || partnerNames[selectedRoom.recipientId] || selectedRoom.recipientId }
    : null;

  if (!connected) {
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
                partnerName={room.recipientName || partnerNames[room.recipientId] || room.recipientId}
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
                currentUsername={userId}
                senderName={senderDisplayName}
                messages={conversationMessages}
                onSend={handleSend}
                listingId={selectedRoom?.listingId}
                listingGameName={selectedRoom?.listingGameName}
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
