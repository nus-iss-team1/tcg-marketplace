"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { getCardTypes, type CardType } from "@/lib/listings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
// import { CardFan } from "@/components/card-fan";


export default function LandingPage() {
  const { loading } = useAuth();
  const [gameTypes, setGameTypes] = useState<CardType[]>([]);

  useEffect(() => {
    document.title = "VAULT OF CARDS";
    getCardTypes().then(setGameTypes);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-4">
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
    <div className="flex flex-1 flex-col items-center justify-center">
      {/* Hero section */}
      <div className="relative w-full">
        {/* Background card fan — hidden for now */}
        {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
          <CardFan className="h-72 w-56 sm:h-80 sm:w-60 md:h-96 md:w-72" />
        </div> */}

        <Card className="relative z-10 border-0 bg-transparent shadow-none">
          <CardHeader className="px-0 pb-4 sm:pb-6 items-center text-center">
            <Badge className="w-fit mx-auto mb-3 sm:mb-4 font-heading text-lg sm:text-xl tracking-[0.15em] px-2 py-0.5 animate-[fade-up_0.5s_ease-out_both]">
              VOC
            </Badge>
            <div className="text-center max-w-5xl mx-auto">
              <CardTitle className="text-7xl sm:text-8xl md:text-8xl lg:text-9xl leading-none animate-[fade-up_0.5s_ease-out_0.1s_both]">
                <span className="bg-linear-to-r from-foreground to-foreground/85 bg-clip-text text-transparent">
                  The marketplace for every collector
                </span>
              </CardTitle>
              <CardDescription className="mt-3 mx-auto sm:mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed text-center w-full sm:w-96 md:w-md lg:w-lg animate-[fade-up_0.5s_ease-out_0.2s_both]">
                Discover, buy, and sell trading cards from Pok&eacute;mon,
                Yu-Gi-Oh!, and more — all in one place.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-4 px-0 animate-[fade-up_0.5s_ease-out_0.3s_both]">
            <p className="text-lg font-heading tracking-wider text-foreground mb-2">Start Exploring</p>
            <div className="flex flex-wrap justify-center gap-2">
              {gameTypes.map((game) => (
                <Link
                  key={game.value}
                  href={`/marketplace?game=${encodeURIComponent(game.value)}`}
                  className="text-xs text-muted-foreground border border-border px-3 py-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200 ease-in-out"
                >
                  {game.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

