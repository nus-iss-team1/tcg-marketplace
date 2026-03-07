"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayersIcon, LogOutIcon, SearchIcon, UserIcon } from "lucide-react";
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

export function AppHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const initials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "?";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="flex h-12 sm:h-14 shrink-0 items-center gap-4 sm:gap-6 lg:gap-8 border-b px-4 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="hidden md:flex items-center gap-1.5 text-lg font-semibold shrink-0"
      >
        <LayersIcon className="h-5 w-5 text-primary" />
        TCG Marketplace
      </Link>
      <Link href="/" className="flex md:hidden items-center gap-1.5 text-base font-semibold shrink-0">
        <LayersIcon className="h-5 w-5 text-primary sm:hidden" />
        TCG
      </Link>

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto"
      >
        <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search listings or sellers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-8 sm:h-9 text-sm bg-muted"
        />
      </form>

      {user ? (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user.isAdmin && (
            <Badge variant="default" className="hidden md:inline-flex text-xs">
              Admin
            </Badge>
          )}

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
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{user.username}</p>
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
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
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
  );
}
