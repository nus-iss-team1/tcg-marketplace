"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CardFan } from "@/components/card-fan";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = "TCG Marketplace";
  }, []);

  const handleCreateListing = () => {
    if (user) {
      router.push("/listing/create");
    } else {
      router.push("/login?tab=signin&redirect=/listing/create");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />

      {/* Hero section */}
      <main className="flex flex-1 items-center px-4 sm:px-8 md:px-12 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-10 items-center">
          {/* Left — Hero card with background card fan on mobile */}
          <div className="relative">
            {/* Background card fan — mobile only */}
            <div className="absolute inset-0 flex items-center justify-center lg:hidden pointer-events-none opacity-[0.06]">
              <CardFan className="h-72 w-56 sm:h-80 sm:w-60" />
            </div>

            <Card className="relative z-10 border-0 bg-transparent shadow-none">
              <CardHeader className="px-0 pb-4 sm:pb-6 items-center text-center lg:items-start lg:text-left">
                <Badge className="w-fit mx-auto lg:mx-0 mb-3 sm:mb-4 font-heading text-lg sm:text-xl tracking-[0.15em] px-2 py-0.5 animate-[fade-up_0.5s_ease-out_both]">
                  HOC
                </Badge>
                <CardTitle className="text-5xl sm:text-6xl md:text-7xl leading-none animate-[fade-up_0.5s_ease-out_0.1s_both]">
                  <span className="bg-linear-to-r from-foreground to-foreground/85 bg-clip-text text-transparent">
                    Your One-Stop Destination for All TCG Needs
                  </span>
                </CardTitle>
                <CardDescription className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-[fade-up_0.5s_ease-out_0.2s_both]">
                  Discover rare cards, build your dream collection, and connect
                  with fellow collectors. Whether you&apos;re hunting for vintage
                  gems or the latest releases, our marketplace brings the entire
                  trading card community together in one place.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-row justify-center lg:justify-start gap-3 px-0 animate-[fade-up_0.5s_ease-out_0.3s_both]">
                <Button size="lg" asChild>
                  <Link href="/marketplace">
                    Start Exploring
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleCreateListing}
                >
                  Create Listing
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right — Card fan illustration (desktop only) */}
          <div className="hidden lg:flex items-center justify-center">
            <CardFan className="h-96 w-72" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-4 animate-[fade-in_0.5s_ease-out_0.5s_both]">
        <p className="text-center text-xs text-muted-foreground">
          &copy; 2026 TCG Marketplace. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
