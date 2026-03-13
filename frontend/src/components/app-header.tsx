"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, MenuIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCardTypes, type CardType } from "@/lib/listings";

export function AppHeader({ children }: { children?: React.ReactNode } = {}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);

  useEffect(() => {
    getCardTypes().then(setCardTypes);
  }, []);

  const homeHref = user ? "/" : "/";

  const handleSignOut = () => {
    setSidebarOpen(false);
    signOut();
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex h-12 sm:h-14 shrink-0 items-center gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 bg-background">
        {/* Mobile: hamburger on the left */}
        {user && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        )}

        <Link
          href={homeHref}
          className="absolute left-1/2 -translate-x-1/2 font-heading text-lg sm:text-xl tracking-[0.15em]"
        >
          HOUSE OF CARDS
        </Link>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {children}

            {/* Desktop: Shop dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex items-center gap-1 h-8 rounded-none px-1 text-xs">
                  Shop
                  <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {cardTypes.map((game) => (
                  <DropdownMenuItem key={game.value} asChild className="focus:bg-transparent hover:bg-transparent hover:text-muted-foreground">
                    <Link href={`/marketplace?game=${encodeURIComponent(game.value)}`}>{game.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop: Account dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex items-center gap-1 h-8 rounded-none px-1 text-xs">
                  Account
                  <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild className="focus:bg-transparent hover:bg-transparent hover:text-muted-foreground">
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent hover:bg-transparent hover:text-muted-foreground">
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-transparent hover:bg-transparent hover:text-muted-foreground" onClick={() => { signOut(); router.push("/"); }}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            {children}
            <Link
              href="/login"
              className="text-xs hover:text-muted-foreground transition-colors"
            >
              Login
            </Link>
          </div>
        )}
      </header>

      {/* Mobile sidebar */}
      {user && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0 bg-background">
            <SheetHeader className="p-4 pb-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
            </SheetHeader>

            {/* Card types */}
            <nav className="flex flex-col px-2 mt-2">
              <p className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Browse</p>
              {cardTypes.map((game) => (
                <Link
                  key={game.value}
                  href={`/marketplace?game=${encodeURIComponent(game.value)}`}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 rounded-none px-3 py-2.5 text-xs hover:text-muted-foreground transition-colors"
                >
                  {game.label}
                </Link>
              ))}
            </nav>

            <div className="mx-4 my-2 h-px bg-border" />

            <nav className="flex flex-col px-2">
              <Link
                href="/profile"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-none px-3 py-2.5 text-xs hover:text-muted-foreground transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-none px-3 py-2.5 text-xs hover:text-muted-foreground transition-colors"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 rounded-none px-3 py-2.5 text-xs hover:text-muted-foreground transition-colors w-full cursor-pointer"
              >
                Sign Out
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
