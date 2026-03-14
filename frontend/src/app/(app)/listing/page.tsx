"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { EmptyState } from "@/components/empty-state";
import { PageContainer, PageHeader } from "@/components/page-header";
import { ListingCard } from "@/components/listing-card";
import { PaginationControls } from "@/components/pagination-controls";
import { fetchSellerListings, type Listing } from "@/lib/listings";

export default function MyListingsPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [listings, setListings] = useState<Listing[]>([]);
  const totalPages = Math.ceil(listings.length / 15) || 1;

  useEffect(() => {
    document.title = "My Listings - VAULT OF CARDS";
  }, []);

  useEffect(() => {
    if (user?.username) {
      fetchSellerListings(user.username).then((res) => setListings(res.listings));
    }
  }, [user?.username]);

  return (
    <PageContainer>
      <PageHeader
        title="My Listings"
        description="Manage your cards"
        action={
          <Button asChild size="sm">
            <Link href="/listing/create">
              New Listing
            </Link>
          </Button>
        }
      />
      {listings.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="You haven't created any listings yet. Start selling your cards!"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
            {listings.map((listing, i) => (
              <ListingCard key={listing.listingId} listing={listing} index={i} />
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
    </PageContainer>
  );
}
