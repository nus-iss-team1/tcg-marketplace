"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayersIcon, ListIcon, LogOutIcon, SearchIcon, UserIcon, GamepadIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GAME_SHORTCUTS = [
  { label: "Pokemon TCG", value: "Pokemon TCG" },
  { label: "Yu-Gi-Oh!", value: "Yu-Gi-Oh!" },
  { label: "Magic: The Gathering", value: "Magic: The Gathering" },
  { label: "Digimon", value: "Digimon Card Game" },
  { label: "One Piece", value: "One Piece Card Game" },
  { label: "Star Wars", value: "Star Wars Unlimited" },
];

export function AppHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  const homeHref = user ? "/marketplace" : "/";
  const initials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "?";

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    closeSearch();
  };

  const handleGameShortcut = (game: string) => {
    router.push(`/marketplace?game=${encodeURIComponent(game)}`);
    closeSearch();
  };

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        closeSearch();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, closeSearch]);

  return (
    <>
      <header className="relative z-50 flex h-12 sm:h-14 shrink-0 items-center gap-4 sm:gap-6 lg:gap-8 border-b px-4 sm:px-6 lg:px-8 bg-background">
        <Link
          href={homeHref}
          className="hidden md:flex items-center gap-1.5 text-lg font-semibold shrink-0"
        >
          <LayersIcon className="h-5 w-5 text-primary" />
          TCG Marketplace
        </Link>
        <Link href={homeHref} className="flex md:hidden items-center gap-1.5 text-base font-semibold shrink-0">
          <LayersIcon className="h-5 w-5 text-primary sm:hidden" />
          TCG
        </Link>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search icon button — hidden on mobile where inline search is shown */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex h-8 w-8"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            {user.isAdmin && (
              <Badge variant="default" className="hidden md:inline-flex text-xs">
                Admin
              </Badge>
            )}

            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      {(user.givenName || user.familyName) && (
                        <p className="text-sm font-medium">
                          {[user.givenName, user.familyName].filter(Boolean).join(" ")}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">{user.username}</p>
                      <div className="flex gap-1">
                        {user.groups.map((group) => (
                          <Badge
                            key={group}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/listing">
                    <ListIcon className="mr-2 h-4 w-4" />
                    My Listings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { signOut(); router.push("/"); }}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex h-8 w-8"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login?tab=signin">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login?tab=signup">Sign Up</Link>
            </Button>
            <ThemeToggle />
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <>
          {/* Backdrop — below header */}
          <div
            className="fixed inset-0 top-12 sm:top-14 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeSearch}
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
      )}
    </>
  );
}
