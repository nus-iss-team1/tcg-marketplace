"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import type { ConversationSummary } from "@/components/conversation-history-card";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface ConversationHeaderProps {
  conversation?: ConversationSummary;
}

export function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = !!conversation?.imageUrl && !imageFailed;

  const handleImageError = useCallback(() => {
    setImageFailed(true);
  }, []);

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card px-4 py-4">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground overflow-hidden">
        {hasImage ? (
          <Image
            src={conversation?.imageUrl as string}
            alt={conversation?.partnerName ?? "Conversation avatar"}
            fill
            className="object-cover"
            onError={handleImageError}
          />
        ) : (
          conversation?.partnerName ? getInitials(conversation.partnerName) : "?"
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Chat with</p>
        <p className="text-lg font-semibold text-foreground">
          {conversation?.partnerName ?? "Select a conversation"}
        </p>
      </div>
    </div>
  );
}
