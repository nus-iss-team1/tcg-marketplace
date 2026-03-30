"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
      className={cn(
        "w-full border px-4 py-3 text-left transition-colors",
        isSelected
          ? "border-border bg-secondary"
          : "border-border bg-background hover:bg-secondary/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground overflow-hidden">
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
          <div className="text-xs font-semibold text-foreground">{conversation.partnerName}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground normal-case">{conversation.latestText}</div>
        </div>
        <div className="shrink-0 text-[10px] text-muted-foreground">{formatConversationDate(conversation.lastDate)}</div>
      </div>
    </button>
  );
}
