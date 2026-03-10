"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, GamepadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GAME_SHORTCUTS = [
  { label: "Pokemon TCG", value: "Pokemon TCG" },
  { label: "Yu-Gi-Oh!", value: "Yu-Gi-Oh!" },
  { label: "Magic: The Gathering", value: "Magic: The Gathering" },
  { label: "Digimon", value: "Digimon Card Game" },
  { label: "One Piece", value: "One Piece Card Game" },
  { label: "Star Wars", value: "Star Wars Unlimited" },
];

export function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="hidden md:inline-flex h-8 w-8"
      onClick={onClick}
    >
      <SearchIcon className="h-4 w-4" />
      <span className="sr-only">Search</span>
    </Button>
  );
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  const close = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    close();
  };

  const handleGameShortcut = (game: string) => {
    router.push(`/marketplace?game=${encodeURIComponent(game)}`);
    close();
  };

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        close();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop — below header */}
      <div
        className="fixed inset-0 top-12 sm:top-14 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={close}
      />

      {/* Search dropdown — below header */}
      <div
        ref={searchRef}
        className="absolute left-0 right-0 top-12 sm:top-14 z-50 bg-background border-b shadow-lg origin-top animate-[search-dropdown_0.2s_ease-out_both]"
      >
        <div className="w-full max-w-2xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search listings or sellers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-10 text-sm bg-muted"
              />
            </div>
          </form>

          <div
            className="overflow-hidden transition-[height] duration-200 ease-in-out"
            style={{ height: contentHeight !== undefined ? `${contentHeight}px` : "auto" }}
          >
            <div ref={contentRef}>
              {query.trim() ? (
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs text-muted-foreground">Games matching &ldquo;{query.trim()}&rdquo;</p>
                  {GAME_SHORTCUTS.filter((game) =>
                    game.label.toLowerCase().includes(query.trim().toLowerCase()) ||
                    game.value.toLowerCase().includes(query.trim().toLowerCase())
                  ).length > 0 ? (
                    <div className="space-y-1">
                      {GAME_SHORTCUTS.filter((game) =>
                        game.label.toLowerCase().includes(query.trim().toLowerCase()) ||
                        game.value.toLowerCase().includes(query.trim().toLowerCase())
                      ).map((game, i) => (
                        <button
                          key={game.value}
                          type="button"
                          onClick={() => handleGameShortcut(game.value)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted transition-colors cursor-pointer animate-[fade-up_0.15s_ease-out_both]"
                          style={{ animationDelay: `${0.03 * i}s` }}
                        >
                          <GamepadIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="text-left min-w-0">
                            <p className="text-sm font-medium truncate">{game.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{game.value}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-3 text-center">No matching games found</p>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Browse by game</p>
                  <div className="flex flex-wrap gap-2">
                    {GAME_SHORTCUTS.map((game, i) => (
                      <button
                        key={game.value}
                        type="button"
                        onClick={() => handleGameShortcut(game.value)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full border bg-muted/50 hover:bg-muted transition-colors cursor-pointer animate-[fade-up_0.2s_ease-out_both]"
                        style={{ animationDelay: `${0.03 * i}s` }}
                      >
                        {game.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
