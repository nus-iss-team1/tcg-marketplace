"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ConversationHeader } from "@/components/conversation-header";
import { ConversationMessage } from "@/components/conversation-message";
import { ConversationInput } from "@/components/conversation-input";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/messaging";
import type { Listing } from "@/lib/listings";

export interface ChatPartner {
  id: string;
  name: string;
  imageUrl?: string;
}

interface ChatroomProps {
  partner: ChatPartner;
  currentUserId: string;
  senderName?: string;
  messages: Message[];
  onSend: (text: string) => void;
  listing?: Listing;
  className?: string;
}


export function Chatroom({ partner, currentUserId, senderName, messages, onSend, className }: ChatroomProps) {
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  }, [draft, onSend]);

  return (
    <div className={cn("flex flex-col min-h-0", className)}>
      <ConversationHeader
        partnerName={partner.name}
        partnerImageUrl={partner.imageUrl}
      />
      <div className="mt-3 flex-1 flex flex-col-reverse overflow-y-auto space-y-3 space-y-reverse py-2 min-h-0">

          <div ref={messagesEndRef} />
          {[...messages].reverse().map((message, i) => (
            <ConversationMessage
              key={message.messageId}
              message={message}
              currentUserId={currentUserId}
              partnerName={partner.name}
              imageUrl={partner.imageUrl}
              senderName={senderName}
              index={i}
            />
          ))}
      </div>
      <ConversationInput
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
      />
    </div>
  );
}
