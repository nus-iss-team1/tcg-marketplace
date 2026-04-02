"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Room } from "@/lib/messaging";

function formatConversationDate(timestamp: number) {
  const date = new Date(timestamp);
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
  room: Room;
  currentUserId: string;
  partnerName: string;
  partnerImageUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function ConversationHistoryCard({
  room,
  currentUserId,
  partnerName,
  partnerImageUrl,
  isSelected,
  onSelect,
}: ConversationHistoryCardProps) {
  const isSentByMe = room.latestMessageSenderId === currentUserId;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!partnerImageUrl && !imageFailed;

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
              src={partnerImageUrl as string}
              alt={partnerName}
              fill
              className="object-cover"
              onError={handleImageError}
            />
          ) : (
            getInitials(partnerName)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-foreground">{partnerName}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground normal-case">
            {isSentByMe && <span className="text-foreground">You: </span>}
            {room.latestMessage}
          </div>
        </div>
        <div className="shrink-0 text-[10px] text-muted-foreground">{formatConversationDate(room.updatedAt)}</div>
      </div>
    </button>
  );
}
