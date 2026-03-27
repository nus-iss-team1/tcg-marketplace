"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

import { XIcon } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { fetchMarketplaceListings, type Listing } from "@/lib/listings";
import Link from "next/link";

const SORT_OPTIONS = [
  { value: "updatedAt", label: "Recent" },
  { value: "cardName", label: "Card Name" },
  { value: "price", label: "Price" },
] as const;

type SortType = (typeof SORT_OPTIONS)[number]["value"];

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const gameType = searchParams.get("game") || "Pokemon TCG";

  const [currentPage, setCurrentPage] = useState(1);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const totalPages = Math.ceil(listings.length / 15) || 1;

  const imageCount = listings.filter((l) => l.thumbnail || l.attachment?.front).length;
  const allReady = !loading && (listings.length === 0 || imageCount === 0 || imagesLoaded >= imageCount);

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [sort, setSort] = useState<SortType>("updatedAt");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");

  useEffect(() => {
    document.title = `Marketplace - VAULT OF CARDS`;
  }, [gameType]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const baseParams = { sort, order };
      const searchValue = activeQuery.toLowerCase();

      try {
        let results: Listing[];
        if (activeQuery) {
          const [byTitle, byCard] = await Promise.all([
            fetchMarketplaceListings(gameType, { ...baseParams, filter: "title", filterValue: searchValue }),
            fetchMarketplaceListings(gameType, { ...baseParams, filter: "cardName", filterValue: searchValue }),
          ]);
          const seen = new Set<string>();
          const merged: Listing[] = [];
          for (const listing of [...byTitle.listings, ...byCard.listings]) {
            if (!seen.has(listing.listingId)) {
              seen.add(listing.listingId);
              merged.push(listing);
            }
          }
          results = merged;
        } else {
          const res = await fetchMarketplaceListings(gameType, baseParams);
          results = res.listings;
        }

        if (!cancelled) {
          setListings(results);
          setCurrentPage(1);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setImagesLoaded(0);
    /* eslint-enable react-hooks/set-state-in-effect */
    run();

    return () => { cancelled = true; };
  }, [gameType, sort, order, activeQuery]);

  const handleImageLoad = useCallback(() => {
    setImagesLoaded((prev) => prev + 1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(query.trim());
  };

  const handleClearSearch = () => {
    setQuery("");
    setActiveQuery("");
  };


  return (
    <>
      {/* Header */}
      <div className="shrink-0">
        <PageHeader title="Marketplace" description={gameType} />
      </div>

      {/* Search + Sort — sticky floating */}
      <div className="sticky top-12 sm:top-14 z-40 mb-4 w-full max-w-lg md:max-w-2xl mx-auto bg-background/40 backdrop-blur-md rounded-md px-3 py-2">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground/30 text-sm pointer-events-none">/</span>
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-4 pr-6 py-1 text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground placeholder:capitalize"
            />
            {(query || activeQuery) && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs shrink-0">
            {SORT_OPTIONS.map((opt, i) => (
              <span key={opt.value} className="flex items-center gap-1">
                {i > 0 && <span className="text-muted-foreground/30">&middot;</span>}
                <button
                  type="button"
                  onClick={() => {
                    if (sort === opt.value) {
                      setOrder((o) => (o === "DESC" ? "ASC" : "DESC"));
                    } else {
                      setSort(opt.value as SortType);
                      setOrder("DESC");
                    }
                  }}
                  className={`px-1 py-0.5 transition-colors ${
                    sort === opt.value
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}{sort === opt.value ? (order === "DESC" ? " \u2193" : " \u2191") : ""}
                </button>
              </span>
            ))}
          </div>
        </form>
        {activeQuery && (
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Results for &ldquo;{activeQuery}&rdquo;
          </p>
        )}
      </div>

      {/* Listings */}
      {allReady && listings.length === 0 ? (
        <EmptyState
          title={activeQuery ? "No results found" : "No listings yet"}
          description={
            activeQuery
              ? "Try a different search term or clear the filter."
              : "This category is awaiting its first listing. Be the first to showcase your cards."
          }
        >
          {activeQuery ? (
            <Button size="sm" variant="secondary" onClick={handleClearSearch}>
              Clear Search
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/listing/create">Create Listing</Link>
            </Button>
          )}
        </EmptyState>
      ) : (
        <div key={`${activeQuery}-${sort}-${order}`} className={allReady ? "animate-[fade-up_0.4s_ease-out_both]" : "opacity-0"}>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
            {listings.map((listing, i) => (
              <ListingCard key={listing.listingId} listing={listing} index={i} onImageLoad={handleImageLoad} />
            ))}
          </div>

          <div className="h-14 sm:hidden" />

          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-8 sticky bottom-2 sm:static bg-background/40 backdrop-blur-md py-3 sm:py-0 sm:bg-transparent sm:backdrop-blur-none rounded-none mx-2 sm:mx-0"
            />
          )}
        </div>
      )}
    </>
  );
}
