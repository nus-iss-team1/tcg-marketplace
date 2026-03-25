"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { PlusIcon } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { fetchSellerListings, type Listing } from "@/lib/listings";
import Link from "next/link";

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

export function ProfileContent({ profile, isOwnProfile }: ProfileContentProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(listings.length / 15) || 1;

  useEffect(() => {
    let cancelled = false;
    fetchSellerListings(profile.username)
      .then((res) => { if (!cancelled) setListings(res.listings); })
      .finally(() => { if (!cancelled) setLoadingListings(false); });
    return () => { cancelled = true; };
  }, [profile.username]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Listings section */}
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
          >
            {isOwnProfile && (
              <Button asChild size="sm">
                <Link href="/listing/create">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Create Listing
                </Link>
              </Button>
            )}
          </EmptyState>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
              {listings.map((listing, i) => (
                <ListingCard key={listing.listingId} listing={listing} index={i} animationDelayOffset={0.15} />
              ))}
            </div>

            <div className="h-14 sm:hidden" />

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-8 sticky bottom-2 sm:static bg-background/40 backdrop-blur-md py-3 sm:py-0 sm:bg-transparent sm:backdrop-blur-none rounded-none mx-2 sm:mx-0"
            />
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
