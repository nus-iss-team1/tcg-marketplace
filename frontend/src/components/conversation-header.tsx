"use client";

import { useCallback, useState } from "react";
import Image from "next/image";

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
  partnerName: string;
  partnerImageUrl?: string;
}

export function ConversationHeader({ partnerName, partnerImageUrl }: ConversationHeaderProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = !!partnerImageUrl && !imageFailed;

  const handleImageError = useCallback(() => {
    setImageFailed(true);
  }, []);

  return (
    <div className="flex items-center gap-3 border-b border-border pb-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground overflow-hidden">
        {hasImage ? (
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
      <div>
        <p className="text-xs text-muted-foreground">Chat with</p>
        <p className="text-sm font-semibold text-foreground">{partnerName}</p>
      </div>
    </div>
  );
}
