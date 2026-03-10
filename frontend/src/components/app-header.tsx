"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayersIcon, LogOutIcon, MenuIcon, SettingsIcon, UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function AppHeader({ children }: { children?: React.ReactNode } = {}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const homeHref = user ? "/marketplace" : "/";
  const initials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "?";

  const handleSignOut = () => {
    setSidebarOpen(false);
    signOut();
    router.push("/");
  };

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
            {children}

            <ThemeToggle />

            {/* Mobile: hamburger → sidebar */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>

            {/* Desktop: avatar → dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative hidden md:flex h-8 w-8 rounded-full">
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
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
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
            {children}
            <Button size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <ThemeToggle />
          </div>
        )}
      </header>

      {/* Mobile sidebar */}
      {user && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="right" className="w-72 p-0">
            <SheetHeader className="p-4 pb-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 min-w-0">
                  {(user.givenName || user.familyName) && (
                    <p className="text-sm font-medium truncate">
                      {[user.givenName, user.familyName].filter(Boolean).join(" ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{user.username}</p>
                  <div className="flex gap-1 mt-0.5">
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
            </SheetHeader>

            <Separator className="my-3" />

            <nav className="flex flex-col px-2">
              <Link
                href="/profile"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                Settings
              </Link>
            </nav>

            <Separator className="my-3" />

            <nav className="flex flex-col px-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors w-full cursor-pointer"
              >
                <LogOutIcon className="h-4 w-4 text-muted-foreground" />
                Sign Out
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
