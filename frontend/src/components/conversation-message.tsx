"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface Message {
  id: string;
  sender: "me" | "partner";
  text: string;
  date: Date;
}

function formatMessageDate(date: Date) {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month} ${day} ${hours}:${minutes}`;
}

function getInitials(name: string) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface ConversationMessageProps {
  message: Message;
  partnerName: string;
  imageUrl?: string;
  senderName?: string;
  index?: number;
}

export function ConversationMessage({ message, partnerName, imageUrl, senderName, index = 0 }: ConversationMessageProps) {
  const isPartner = message.sender === "partner";
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = isPartner && !!imageUrl && !imageFailed;

  const handleImageError = useCallback(() => {
    setImageFailed(true);
  }, []);

  const initials = getInitials(isPartner ? partnerName : (senderName || partnerName));

  return (
    <div
      className={cn("flex items-end gap-2 animate-[fade-up_0.3s_ease-out_both]", isPartner ? "justify-start" : "justify-end sm:justify-start")}
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      <Avatar className={cn("h-8 w-8 shrink-0", isPartner ? "" : "hidden sm:flex order-last sm:order-first")}>
        {showImage ? (
          <div className="relative h-full w-full">
            <Image
              src={imageUrl as string}
              alt="Partner avatar"
              fill
              className="object-cover"
              onError={handleImageError}
            />
          </div>
        ) : (
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        )}
      </Avatar>
      <div>
        <p className="text-[10px] text-muted-foreground mb-0.5 normal-case">
          {isPartner ? partnerName : (senderName || "You")}
        </p>
        <div className={cn(
          "min-w-24 sm:min-w-32 md:min-w-40 max-w-[75%] px-3 py-2 text-xs normal-case",
          isPartner
            ? "bg-card text-foreground border border-border"
            : "bg-primary text-primary-foreground"
        )}>
          <p>{message.text}</p>
        <p className={cn(
          "mt-1 text-[10px]",
          isPartner ? "text-muted-foreground" : "text-primary-foreground/70"
        )}>
          {formatMessageDate(message.date)}
        </p>
        </div>
      </div>
    </div>
  );
}
