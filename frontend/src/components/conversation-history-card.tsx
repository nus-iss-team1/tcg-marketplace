"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

export interface ConversationSummary {
  id: string;
  partnerName: string;
  imageUrl?: string;
  latestText: string;
  lastDate: Date;
}

function formatConversationDate(date: Date) {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month} ${day}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface ConversationHistoryCardProps {
  conversation: ConversationSummary;
  isSelected: boolean;
  onSelect: () => void;
}

export function ConversationHistoryCard({
  conversation,
  isSelected,
  onSelect,
}: ConversationHistoryCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!conversation.imageUrl && !imageFailed;

  const handleImageError = useCallback(() => {
    setImageFailed(true);
  }, []);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-3xl border px-4 py-3 text-left transition-all duration-200 ${
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/70 hover:bg-accent/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground overflow-hidden">
          {showImage ? (
            <Image
              src={conversation.imageUrl as string}
              alt={conversation.partnerName}
              fill
              className="object-cover"
              onError={handleImageError}
            />
          ) : (
            getInitials(conversation.partnerName)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">{conversation.partnerName}</div>
          <div className="mt-1 truncate text-xs text-muted-foreground normal-case">{conversation.latestText}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{formatConversationDate(conversation.lastDate)}</div>
    </button>
  );
}
