"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { ConversationHistoryCard, type ConversationSummary } from "@/components/conversation-history-card";
import { ConversationHeader } from "@/components/conversation-header";
import { ConversationMessage, type Message } from "@/components/conversation-message";
import { ConversationInput } from "@/components/conversation-input";


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
    {
      id: "m1",
      sender: "partner",
      text: "Hey, are you still selling the Charizard?",
      date: new Date("2026-04-02T09:14:00"),
    },
    {
      id: "m2",
      sender: "me",
      text: "Yes, the card is still available and in near-mint condition.",
      date: new Date("2026-04-02T09:22:00"),
    },
    {
      id: "m3",
      sender: "partner",
      text: "Sounds good — I can ship it tomorrow.",
      date: new Date("2026-04-02T09:27:00"),
    },
  ],
  "2": [
    {
      id: "m4",
      sender: "partner",
      text: "Can you confirm the card condition?",
      date: new Date("2026-03-30T14:50:00"),
    },
    {
      id: "m5",
      sender: "me",
      text: "It is lightly played with no bends or creases.",
      date: new Date("2026-03-30T14:58:00"),
    },
  ],
  "3": [
    {
      id: "m6",
      sender: "partner",
      text: "Thanks! I received it today.",
      date: new Date("2026-03-28T18:05:00"),
    },
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
  const [selectedConversationId, setSelectedConversationId] = useState<string>(conversationSummaries[0].id);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>(initialMessages);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    document.title = "Messages - VAULT OF CARDS";
  }, []);

  const selectedConversation = conversationSummaries.find(
    (conversation) => conversation.id === selectedConversationId
  );

  const conversationMessages = selectedConversationId
    ? messagesByConversation[selectedConversationId] ?? []
    : [];

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed || !selectedConversationId) {
      return;
    }

    const newMessage: Message = {
      id: `${selectedConversationId}-send-${Date.now()}`,
      sender: "me",
      text: trimmed,
      date: new Date(),
    };

    setMessagesByConversation((current) => ({
      ...current,
      [selectedConversationId]: [...(current[selectedConversationId] ?? []), newMessage],
    }));
    setDraft("");
  }, [draft, selectedConversationId]);

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 text-3xl font-heading tracking-[0.25em] text-foreground">Messages</div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Conversation history
          </h2>
          <div className="space-y-3">
            {conversationSummaries.map((conversation) => (
              <ConversationHistoryCard
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onSelect={() => setSelectedConversationId(conversation.id)}
              />
            ))}
          </div>
        </section>

        <section className="flex min-h-[640px] flex-col rounded-3xl border border-border bg-card p-4 shadow-sm">
          <ConversationHeader conversation={selectedConversation} />
          <div className="mt-5 flex-1 overflow-hidden rounded-3xl border border-border bg-background p-4">
            <div className="flex h-full flex-col gap-4 overflow-y-auto pr-2">
              {conversationMessages.length > 0 ? (
                conversationMessages.map((message) => (
                  <ConversationMessage
                    key={message.id}
                    message={message}
                    partnerName={selectedConversation?.partnerName ?? "?"}
                    imageUrl={selectedConversation?.imageUrl}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No messages in this conversation yet.</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <ConversationInput
              value={draft}
              onChange={(value) => setDraft(value)}
              onSend={handleSend}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

