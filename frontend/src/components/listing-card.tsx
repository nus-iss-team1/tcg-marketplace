import Link from "next/link";
import { type Listing } from "@/lib/listings";
import { ImagePlaceholder } from "@/components/image-placeholder";

interface ListingCardProps {
  listing: Listing;
  index: number;
  animationDelayOffset?: number;
}

export function ListingCard({ listing, index, animationDelayOffset = 0 }: ListingCardProps) {
  return (
    <Link
      key={listing.listingId}
      href="/listing/sample"
      className="group cursor-pointer animate-[fade-up_0.4s_ease-out_both]"
      style={{ animationDelay: `${0.05 * index + animationDelayOffset}s` }}
    >
      <div className="overflow-hidden">
        <div className="transition-transform duration-500 ease-out group-hover:scale-105">
          <ImagePlaceholder className="w-full" seed={listing.listingId} />
        </div>
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-xs sm:text-sm truncate leading-tight">
          {listing.cardName}
        </p>
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">
          ${listing.price}
        </p>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground/70 truncate leading-tight normal-case">
          @{listing.sellerId}
        </p>
      </div>
    </Link>
  );
}
