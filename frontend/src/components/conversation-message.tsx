"use client";

import { useCallback, useState } from "react";
import Image from "next/image";

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
    .split(" ")
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
}

export function ConversationMessage({ message, partnerName, imageUrl }: ConversationMessageProps) {
  const isPartner = message.sender === "partner";
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!imageUrl && !imageFailed;

  const handleImageError = useCallback(() => {
    setImageFailed(true);
  }, []);

  return (
    <div className={`flex items-start ${isPartner ? "gap-3 justify-start" : "justify-end"}`}>
      {isPartner && (
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground overflow-hidden">
          {showImage ? (
            <Image
              src={imageUrl as string}
              alt="Partner avatar"
              fill
              className="object-cover"
              onError={handleImageError}
            />
          ) : (
            getInitials(partnerName)
          )}
        </div>
      )}
      <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm normal-case ${
        isPartner ? "bg-card text-foreground" : "bg-primary text-primary-foreground"
      }`}>
        <p>{message.text}</p>
        <p className="mt-2 text-[11px] text-muted-foreground normal-case">{formatMessageDate(message.date)}</p>
      </div>
    </div>
  );
}
