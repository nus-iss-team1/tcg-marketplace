"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { fetchSellerListings, type Listing } from "@/lib/listings";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

export interface ProfileData {
  username: string;
  displayName: string;
  joinedAt?: number;
  address?: string;
  bio?: string;
  preferredPayment?: {
    cash: boolean;
    paynow: boolean;
    bank: boolean;
  };
}

interface ProfileContentProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
}

const PAGE_SIZE = 15;

export function ProfileContent({ profile, isOwnProfile }: ProfileContentProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const cursorRef = useRef<string | undefined>(undefined);
  const hasMore = useRef(true);

  useEffect(() => {
    let cancelled = false;
    fetchSellerListings(profile.username, { limit: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) {
          setListings(res.listings);
          cursorRef.current = res.cursor;
          hasMore.current = !!res.cursor && res.listings.length > 0;
        }
      })
      .finally(() => { if (!cancelled) setLoadingListings(false); });
    return () => { cancelled = true; };
  }, [profile.username]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore.current || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const res = await fetchSellerListings(profile.username, {
        limit: PAGE_SIZE, cursor: cursorRef.current,
      });
      setListings((prev) => [...prev, ...res.listings]);
      cursorRef.current = res.cursor;
      hasMore.current = !!res.cursor && res.listings.length > 0;
    } catch {
      hasMore.current = false;
    } finally {
      setLoadingMore(false);
    }
  }, [profile.username, loadingMore]);

  const sentinelRef = useInfiniteScroll(loadMore, !loadingListings && hasMore.current && !loadingMore, profile.username);

  return (
    <div className="flex flex-col gap-3 w-full px-4">
      <div>
        <h3 className="text-sm text-muted-foreground mb-4 animate-[fade-up_0.4s_ease-out_both]" style={{ animationDelay: "0.1s" }}>
          Listings ({listings.length})
        </h3>

        {loadingListings ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-5/7 w-full rounded-none" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            title="No listings yet"
            description={
              isOwnProfile
                ? "You haven't created any listings yet."
                : "This user hasn't listed any cards yet."
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
              {listings.map((listing, i) => (
                <ListingCard key={listing.listingId} listing={listing} index={i} animationDelayOffset={0.15} />
              ))}
            </div>

            <div ref={sentinelRef} className="h-1" />

            {loadingMore && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6 md:gap-8 mt-5 sm:mt-6 md:mt-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-5/7 w-full rounded-none" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-4 w-24" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="aspect-5/7 w-full rounded-none" />
        ))}
      </div>
    </div>
  );
}
