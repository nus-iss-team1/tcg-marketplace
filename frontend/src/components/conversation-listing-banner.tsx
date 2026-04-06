"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchSpecificListing, setListingStatus, type Listing } from "@/lib/listings";
import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ConversationListingBannerProps {
  listingId: string;
  gameName: string;
  currentUserId?: string;
}

export function ConversationListingBanner({ listingId, gameName, currentUserId }: ConversationListingBannerProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    setListing(null);

    fetchSpecificListing(gameName, listingId)
      .then((data) => {
        if (!cancelled) setListing(data);
      })
      .catch((err) => {
        console.warn("[ListingBanner] failed to fetch listing:", err);
        if (!cancelled) setError(true);
      });

    return () => { cancelled = true; };
  }, [listingId, gameName]);

  const handleStatusChange = useCallback(async (status: "ACTIVE" | "SOLD") => {
    if (!listing) return;
    setUpdating(true);
    try {
      const updated = await setListingStatus(listing.gameName, listing.listingId, status);
      setListing((prev) => prev ? { ...prev, listingStatus: updated.listingStatus ?? status } : prev);
      toast.success(`Listing marked as ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update listing status");
    } finally {
      setUpdating(false);
    }
  }, [listing]);

  if (error) {
    return (
      <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">Unable to load listing details</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-2 animate-pulse">
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
    );
  }

  const thumbnail = listing.attachment?.front || listing.attachment?.images?.[0];
  const listingUrl = `/listing/${listing.listingId}?game=${encodeURIComponent(listing.gameName)}`;
  const isOwner = currentUserId === listing.sellerId;
  const status = listing.listingStatus ?? "ACTIVE";

  return (
    <div className="flex items-center gap-3 rounded-md border border-border/50 bg-muted/30 px-3 py-2">
      <Link href={listingUrl} className="flex items-center gap-3 min-w-0 flex-1 group">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={listing.cardName}
            className="h-10 w-8 rounded-sm object-cover shrink-0"
          />
        ) : (
          <div className="h-10 w-8 rounded-sm bg-muted shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium truncate">{listing.title || listing.cardName}</p>
            <Badge
              variant={status === "ACTIVE" ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0 shrink-0"
            >
              {status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{listing.gameName}</span>
            <span>&middot;</span>
            <span className="text-primary font-medium">${Number(listing.price).toFixed(2)}</span>
          </div>
        </div>
        <ExternalLinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {isOwner && status !== "DELETED" && (
        <div className="flex items-center gap-1.5 shrink-0">
          {status === "ACTIVE" ? (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-[11px] px-2.5"
              disabled={updating}
              onClick={() => handleStatusChange("SOLD")}
            >
              Mark Sold
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] px-2.5"
              disabled={updating}
              onClick={() => handleStatusChange("ACTIVE")}
            >
              Mark Active
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
