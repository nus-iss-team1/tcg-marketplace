"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Listing } from "@/lib/listings";
import { ImagePlaceholder } from "@/components/image-placeholder";

interface ListingCardProps {
  listing: Listing;
  index: number;
  animationDelayOffset?: number;
  onImageLoad?: () => void;
}

export function ListingCard({ listing, index, animationDelayOffset = 0, onImageLoad }: ListingCardProps) {
  const imageUrl = listing.thumbnail || listing.attachment?.front;
  const [loaded, setLoaded] = useState(!imageUrl);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    onImageLoad?.();
  }, [onImageLoad]);

  // If no image, notify parent immediately
  if (!imageUrl && !loaded) {
    onImageLoad?.();
  }

  return (
    <Link
      key={listing.listingId}
      href={`/listing/${listing.listingId}?game=${encodeURIComponent(listing.gameName)}`}
      className="group cursor-pointer animate-[fade-up_0.4s_ease-out_both]"
      style={{ animationDelay: `${0.05 * index + animationDelayOffset}s` }}
    >
      <div className="overflow-hidden">
        <div className="transition-transform duration-500 ease-out group-hover:scale-105">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.cardName}
              width={320}
              height={427}
              className="w-full aspect-5/7 object-contain bg-background"
              onLoad={handleLoad}
              onError={handleLoad}
            />
          ) : (
            <ImagePlaceholder className="w-full" seed={listing.listingId} />
          )}
        </div>
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-xs sm:text-sm truncate leading-tight">
          {listing.title || listing.cardName}
        </p>
        {listing.title && (
          <p className="text-[11px] sm:text-xs text-muted-foreground truncate leading-tight">
            {listing.cardName}
          </p>
        )}
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">
          ${Number(listing.price).toFixed(2)}
        </p>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground/70 truncate leading-tight normal-case">
          @{listing.sellerId}
        </p>
      </div>
    </Link>
  );
}
