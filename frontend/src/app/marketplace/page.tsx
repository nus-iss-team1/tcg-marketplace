"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { XIcon } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMarketplaceListings, getCardTypes, type Listing, type CardType } from "@/lib/listings";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const SORT_OPTIONS = [
  { value: "updatedAt", label: "Recent" },
  { value: "cardName", label: "Card Name" },
  { value: "price", label: "Price" },
] as const;

type SortType = (typeof SORT_OPTIONS)[number]["value"];
const PAGE_SIZE = 20;

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceContent />
    </Suspense>
  );
}

function GameTypeSelector() {
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Marketplace - VAULT OF CARDS";
    getCardTypes()
      .then(setCardTypes)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Marketplace" description="Choose a game" />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
      ) : cardTypes.length === 0 ? (
        <EmptyState
          title="No games available"
          description="Check back later for available card games."
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 animate-[fade-up_0.4s_ease-out_both]">
          {cardTypes.map((game) => (
            <Link
              key={game.value}
              href={`/marketplace?game=${encodeURIComponent(game.value)}`}
              className="w-48 text-center text-xs text-muted-foreground border border-border px-3 py-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200 ease-in-out"
            >
              {game.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const gameType = searchParams.get("game");

  if (!gameType) return <GameTypeSelector />;

  return <MarketplaceListings gameType={gameType} />;
}

function MarketplaceListings({ gameType }: { gameType: string }) {
  const { user } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const cursorRef = useRef<string | undefined>(undefined);
  const hasMore = useRef(true);

  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [activeQuery, setActiveQuery] = useState("");
  const [sort, setSort] = useState<SortType>("updatedAt");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");

  useEffect(() => {
    document.title = `Marketplace - VAULT OF CARDS`;
  }, [gameType]);

  // Initial load + reset on filter/sort change
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const baseParams = { sort, order, limit: PAGE_SIZE };
      const searchValue = activeQuery.toLowerCase();

      try {
        let results: Listing[];
        let nextCursor: string | undefined;

        if (activeQuery) {
          const searchParams = { sort, order, filter: undefined as "title" | "cardName" | "sellerId" | undefined, filterValue: "" };
          const [byTitle, byCard] = await Promise.all([
            fetchMarketplaceListings(gameType, { ...searchParams, filter: "title", filterValue: searchValue }),
            fetchMarketplaceListings(gameType, { ...searchParams, filter: "cardName", filterValue: searchValue }),
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
          nextCursor = undefined; // search doesn't paginate well with merged results
        } else {
          const res = await fetchMarketplaceListings(gameType, baseParams);
          results = res.listings;
          nextCursor = res.cursor;
        }

        if (!cancelled) {
          setListings(results);
          cursorRef.current = nextCursor;
          hasMore.current = !activeQuery && !!nextCursor && results.length > 0;
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    cursorRef.current = undefined;
    hasMore.current = true;
    run();

    return () => { cancelled = true; };
  }, [gameType, sort, order, activeQuery]);

  // Load more
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore.current || !cursorRef.current || activeQuery) return;
    setLoadingMore(true);
    try {
      const res = await fetchMarketplaceListings(gameType, {
        sort, order, limit: PAGE_SIZE, cursor: cursorRef.current,
      });
      setListings((prev) => [...prev, ...res.listings]);
      cursorRef.current = res.cursor;
      hasMore.current = !!res.cursor && res.listings.length >= PAGE_SIZE;
    } catch {
      // stop trying on error
      hasMore.current = false;
    } finally {
      setLoadingMore(false);
    }
  }, [gameType, sort, order, activeQuery, loadingMore]);

  const sentinelRef = useInfiniteScroll(loadMore, !loading && hasMore.current && !loadingMore, `${gameType}-${sort}-${order}-${activeQuery}`);

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
      <div className="shrink-0">
        <PageHeader title="Marketplace" description={gameType} />
      </div>
      {user && (
        <div className="flex justify-end mb-2">
          <Button asChild size="sm">
            <Link href="/listing/create">Create Listing</Link>
          </Button>
        </div>
      )}

      {/* Search + Sort */}
      <div className="sticky top-12 sm:top-14 z-40 mb-4 w-full mx-auto bg-background/40 backdrop-blur-md px-3 py-2">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground/30 text-sm pointer-events-none">/</span>
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full pl-4 pr-6 py-1 text-sm border-0 outline-none px-4 max-w-[500px] placeholder:text-muted-foreground placeholder:capitalize transition-colors ${scrolled ? "bg-transparent" : "bg-muted"}`}
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
      {!loading && listings.length === 0 ? (
        <EmptyState
          title={activeQuery ? "No results found" : "No listings yet"}
          description={
            activeQuery
              ? "Try a different search term or clear the filter."
              : "This category is awaiting its first listing. Be the first to showcase your cards."
          }
        >
          {activeQuery && (
            <Button size="sm" variant="secondary" onClick={handleClearSearch}>
              Clear Search
            </Button>
          )}
        </EmptyState>
      ) : (
        <div key={`${activeQuery}-${sort}-${order}`} className="animate-[fade-up_0.4s_ease-out_both]">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
            {listings.map((listing, i) => (
              <ListingCard key={listing.listingId} listing={listing} index={i} />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />

          {loadingMore && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6 md:gap-8 mt-5 sm:mt-6 md:mt-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-5/7 w-full rounded-none" />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
