"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { fetchMarketplaceListings, type Listing } from "@/lib/listings";
import Link from "next/link";

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameType = searchParams.get("game") || "Pokemon TCG";
  const [currentPage, setCurrentPage] = useState(1);
  const [listings, setListings] = useState<Listing[]>([]);
  const totalPages = Math.ceil(listings.length / 15) || 1;
  useEffect(() => {
    document.title = `Marketplace - VAULT OF CARDS`;
  }, [gameType]);

  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchMarketplaceListings(gameType, { sort: "updatedAt", order: "DESC" }).then((res) => setListings(res.listings));
  }, [gameType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/marketplace?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      {/* Fixed top: title + search */}
      <div className="shrink-0">
        <PageHeader title="Marketplace" description={gameType} />
        {listings.length > 0 && (
          <form onSubmit={handleSearch} className="mb-4 w-full">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="SEARCH LISTINGS..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-9 text-sm bg-muted border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </form>
        )}
      </div>

      {/* Scrollable listings */}
      {listings.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="This category is awaiting its first listing. Be the first to showcase your cards."
        >
          <Button asChild size="sm">
            <Link href="/listing/create">
              Create Listing
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <>
          <div
            className="grid gap-5 sm:gap-6 md:gap-8"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 160px), 1fr))`,
            }}
          >
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
    </>
  );
}
