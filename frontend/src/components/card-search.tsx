"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { fetchCardNames, fetchCardImage } from "@/lib/listings";

const PAGE_SIZE = 10;

interface CardResult {
  cardName: string;
  gameName: string;
  setName?: string;
  cardId?: string;
  rarity?: string;
}

interface CardSearchProps {
  gameName: string;
  value: string;
  onSelect: (card: CardResult) => void;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CardSearch({ gameName, value, onSelect, onChange, disabled }: CardSearchProps) {
  const [allResults, setAllResults] = useState<CardResult[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [images, setImages] = useState<Record<string, string | null>>({});
  const imageCache = useRef<Record<string, string | null>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const search = useCallback(
    (query: string) => {
      if (!gameName || query.length < 2) {
        setAllResults([]);
        setVisible(PAGE_SIZE);
        setImagesReady(false);
        return;
      }
      setLoading(true);
      setImagesReady(false);
      fetchCardNames(gameName, query)
        .then((data) => {
          setAllResults(data);
          setVisible(PAGE_SIZE);
        })
        .catch(() => setAllResults([]))
        .finally(() => setLoading(false));
    },
    [gameName]
  );

  // Fetch images for visible results — wait for all to resolve before showing
  useEffect(() => {
    if (allResults.length === 0) return;
    const displayed = allResults.slice(0, visible);

    // Deduplicate by card name (many cards share the same name)
    const unique = new Map<string, CardResult>();
    for (const card of displayed) {
      const cleanName = card.cardName.replace(/\s*\(.*?\)\s*/g, "").trim();
      if (!unique.has(cleanName)) unique.set(cleanName, card);
    }

    const toFetch: { key: string; card: CardResult }[] = [];
    const cached: Record<string, string | null> = {};

    for (const [cleanName, card] of unique) {
      const key = `${card.gameName}:${cleanName}`;
      if (key in imageCache.current) {
        cached[key] = imageCache.current[key];
      } else {
        toFetch.push({ key, card });
      }
    }

    setImagesReady(false); // eslint-disable-line react-hooks/set-state-in-effect

    if (toFetch.length === 0) {
      // Use a resolved promise to avoid synchronous setState in effect
      Promise.resolve().then(() => {
        setImages(cached);
        setImagesReady(true);
      });
      return;
    }

    Promise.all(
      toFetch.map(({ key, card }) =>
        fetchCardImage(card.gameName, card.cardName).then((url) => {
          imageCache.current[key] = url;
          return [key, url] as const;
        })
      )
    ).then((results) => {
      const merged = { ...cached };
      for (const [key, url] of results) {
        merged[key] = url;
      }
      setImages(merged);
      setImagesReady(true);
    });
  }, [allResults, visible]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setVisible((v) => Math.min(v + 20, allResults.length));
    }
  };

  const handleSelect = (card: CardResult) => {
    onSelect(card);
    onChange(card.cardName);
    setOpen(false);
  };

  const getImageUrl = (card: CardResult) => {
    const cleanName = card.cardName.replace(/\s*\(.*?\)\s*/g, "").trim();
    return images[`${card.gameName}:${cleanName}`] ?? null;
  };

  const displayedResults = allResults.slice(0, visible);
  const showResults = !loading && allResults.length > 0 && imagesReady;

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        placeholder={gameName ? "E.G. CHARIZARD VMAX" : "SELECT A GAME FIRST"}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => value.length >= 2 && setOpen(true)}
        disabled={disabled || !gameName}
        className="h-9"
      />
      {open && value.length >= 2 && (
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[300px] overflow-y-auto rounded-md border bg-background p-1 shadow-md"
        >
          {(loading || !imagesReady) && allResults.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted-foreground">Searching...</p>
          ) : !loading && allResults.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted-foreground">No cards found.</p>
          ) : !showResults ? (
            <p className="py-3 text-center text-xs text-muted-foreground">Loading...</p>
          ) : (
            <div className="animate-[fade-in_0.2s_ease-out_both]">
              {displayedResults.map((card, i) => {
                const imageUrl = getImageUrl(card);
                return (
                  <button
                    key={`${card.cardName}-${card.setName}-${card.cardId}-${i}`}
                    type="button"
                    onClick={() => handleSelect(card)}
                    className="w-full text-left px-2 py-1.5 rounded-sm hover:text-muted-foreground transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-11 shrink-0 rounded-sm overflow-hidden bg-muted">
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={card.cardName}
                          width={32}
                          height={44}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm truncate block">{card.cardName}{card.cardId ? ` (${card.cardId})` : ""}</span>
                      <span className="text-xs text-muted-foreground truncate block">
                        {[card.setName, card.rarity].filter(Boolean).join(" \u00b7 ")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
