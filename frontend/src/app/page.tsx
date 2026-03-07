"use client";

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
import {
  SearchIcon,
  PlusCircleIcon,
  SparklesIcon,
  LayersIcon,
} from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleCreateListing = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
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
      <main className="flex flex-1 items-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left — Hero card */}
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="px-0 pb-4 sm:pb-6">
              <Badge variant="secondary" className="w-fit mb-3 sm:mb-4">
                <SparklesIcon className="mr-1.5 h-3 w-3" />
                Buy, Sell &amp; Trade
              </Badge>
              <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                Your One-Stop Destination for All TCG Needs
              </CardTitle>
              <CardDescription className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                Discover rare cards, build your dream collection, and connect
                with fellow collectors. Whether you&apos;re hunting for vintage
                gems or the latest releases, our marketplace brings the entire
                trading card community together in one place.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-row gap-3 px-0">
              <Button size="lg" asChild>
                <Link href="/marketplace">
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Start Exploring
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleCreateListing}
              >
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
            </CardContent>
          </Card>

          {/* Right — Card stack illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative h-64 w-52 sm:h-72 sm:w-56 md:h-80 md:w-60 lg:h-96 lg:w-72">
              {/* Back card */}
              <Card className="absolute top-0 left-6 sm:left-8 h-full w-full rotate-6 border-2 border-muted">
                <CardContent className="flex h-full items-center justify-center">
                  <LayersIcon className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground/30" />
                </CardContent>
              </Card>
              {/* Middle card */}
              <Card className="absolute top-0 left-3 sm:left-4 h-full w-full rotate-3 border-2 border-muted">
                <CardContent className="flex h-full items-center justify-center">
                  <LayersIcon className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground/40" />
                </CardContent>
              </Card>
              {/* Front card */}
              <Card className="absolute top-0 left-0 h-full w-full border-2 border-primary/20 shadow-xl">
                <CardContent className="flex h-full flex-col items-center justify-center gap-3 sm:gap-4">
                  <SparklesIcon className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
                  <p className="text-sm sm:text-base font-semibold text-card-foreground">
                    Rare Find
                  </p>
                  <Badge variant="secondary">Holographic</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-xs text-muted-foreground">
          &copy; 2026 TCG Marketplace. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
