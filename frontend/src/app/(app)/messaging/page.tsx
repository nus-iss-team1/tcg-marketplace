"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { ConversationHistoryCard, type ConversationSummary } from "@/components/conversation-history-card";
import { Chatroom, type ChatPartner } from "@/components/chatroom";
import type { Message } from "@/components/conversation-message";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/context/AuthContext";
import { fetchSellerProfile } from "@/lib/listings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const conversationSummaries: ConversationSummary[] = [
  {
    id: "1",
    partnerName: "Avery Lane",
    imageUrl: "https://picsum.photos/seed/avery-lane/96/96",
    latestText: "Sounds good — I can ship it tomorrow.",
    lastDate: new Date("2026-04-02"),
  },
  {
    id: "2",
    partnerName: "Milo Chen",
    latestText: "Can you confirm the card condition?",
    lastDate: new Date("2026-03-30"),
  },
  {
    id: "3",
    partnerName: "Riley Park",
    imageUrl: "https://picsum.photos/seed/riley-park/96/96",
    latestText: "Thanks! I received it today.",
    lastDate: new Date("2026-03-28"),
  },
];

const initialMessages: Record<string, Message[]> = {
  "1": [
    { id: "m1", sender: "partner", text: "Hey, are you still selling the Charizard?", date: new Date("2026-04-02T09:14:00") },
    { id: "m2", sender: "me", text: "Yes, the card is still available and in near-mint condition.", date: new Date("2026-04-02T09:22:00") },
    { id: "m3", sender: "partner", text: "Sounds good — I can ship it tomorrow.", date: new Date("2026-04-02T09:27:00") },
  ],
  "2": [
    { id: "m4", sender: "partner", text: "Can you confirm the card condition?", date: new Date("2026-03-30T14:50:00") },
    { id: "m5", sender: "me", text: "It is lightly played with no bends or creases.", date: new Date("2026-03-30T14:58:00") },
  ],
  "3": [
    { id: "m6", sender: "partner", text: "Thanks! I received it today.", date: new Date("2026-03-28T18:05:00") },
  ],
};

export default function MessagingPage() {
  return (
    <Suspense>
      <MessagingContent />
    </Suspense>
  );
}

function MessagingContent() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>(initialMessages);
  const [senderDisplayName, setSenderDisplayName] = useState("");

  useEffect(() => {
    document.title = "Messages - VAULT OF CARDS";
  }, []);

  useEffect(() => {
    const username = user?.username;
    if (!username) return;
    fetchSellerProfile(username).then((profile) => {
      setSenderDisplayName(profile?.displayName || username);
    }).catch(() => {
      setSenderDisplayName(username);
    });
  }, [user?.username]);

  const selectedConversation = conversationSummaries.find(
    (c) => c.id === selectedConversationId
  );

  const conversationMessages = selectedConversationId
    ? messagesByConversation[selectedConversationId] ?? []
    : [];

  const handleSend = useCallback((text: string) => {
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: `${selectedConversationId}-send-${Date.now()}`,
      sender: "me",
      text,
      date: new Date(),
    };

    setMessagesByConversation((current) => ({
      ...current,
      [selectedConversationId]: [...(current[selectedConversationId] ?? []), newMessage],
    }));
  }, [selectedConversationId]);

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  const showConversationList = !selectedConversationId;

  const partner: ChatPartner | null = selectedConversation
    ? { id: selectedConversation.id, name: selectedConversation.partnerName, imageUrl: selectedConversation.imageUrl }
    : null;

  return (
    <div className="flex flex-1 flex-col w-full animate-[fade-up_0.4s_ease-out_both]">
      <PageHeader title="Messages" />

      <div className="flex flex-1 gap-8 sm:gap-10 min-h-0">
        {/* Conversation list */}
        <div className={cn(
          "w-full sm:w-60 md:w-72 lg:w-80 shrink-0 overflow-y-auto min-h-0 space-y-1",
          showConversationList ? "block" : "hidden sm:block"
        )}>
          {conversationSummaries.map((conversation) => (
            <ConversationHistoryCard
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedConversationId}
              onSelect={() => handleSelectConversation(conversation.id)}
            />
          ))}
        </div>

        <div className="hidden sm:block w-px self-stretch bg-border" />

        {/* Chat panel */}
        <div className={cn(
          "flex-1 min-w-0 flex flex-col",
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
                senderName={senderDisplayName}
                messages={conversationMessages}
                onSend={handleSend}
                className="flex-1"
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
