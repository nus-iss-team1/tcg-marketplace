"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ConversationHeader } from "@/components/conversation-header";
import { ConversationMessage } from "@/components/conversation-message";
import { ConversationInput } from "@/components/conversation-input";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/messaging";
import type { Listing } from "@/lib/listings";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

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

function ListingBanner({ listing }: { listing: Listing }) {
  const image = listing.attachment?.front || listing.thumbnail;

  const payment = listing.paymentMethod
    ? [
        listing.paymentMethod.cash && "Cash",
        listing.paymentMethod.paynow && "PayNow",
        listing.paymentMethod.bank && "Bank Transfer",
      ].filter(Boolean).join(", ")
    : null;

  const pickupMatch = listing.pickUp?.match(/^(.+?)\s*\((.+)\)$/);
  const pickupAddress = pickupMatch ? pickupMatch[1] : listing.pickUp;
  const meetupDetails = pickupMatch ? pickupMatch[2] : null;

  return (
    <Accordion type="single" collapsible className="mb-3">
      <AccordionItem value="listing" className="border-0">
        <AccordionTrigger className="px-3 py-2 hover:no-underline">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={listing.cardName}
                className="h-10 w-7 object-cover shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{listing.title || listing.cardName}</p>
              <p className="text-xs text-muted-foreground truncate normal-case">
                {listing.gameName}
                {listing.setName && ` · ${listing.setName}`}
              </p>
            </div>
            <p className="text-sm font-medium shrink-0 mr-2">
              ${Number(listing.price).toFixed(2)}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-2 pt-0">
          <div className="space-y-1.5 text-xs text-muted-foreground normal-case">
            {pickupAddress && (
              <p><span className="text-foreground">Pickup:</span> {pickupAddress}</p>
            )}
            {meetupDetails && (
              <p><span className="text-foreground">Meetup:</span> {meetupDetails}</p>
            )}
            {payment && (
              <p><span className="text-foreground">Payment:</span> {payment}</p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function Chatroom({ partner, currentUserId, senderName, messages, onSend, listing, className }: ChatroomProps) {
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
      {listing && <ListingBanner listing={listing} />}
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
