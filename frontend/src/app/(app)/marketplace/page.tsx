"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

const PLACEHOLDER_CARDS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Card #${String(i + 1).padStart(3, "0")}`,
  price: (Math.random() * 100 + 1).toFixed(2),
  lister: `user${i + 1}`,
  listerName: `User ${i + 1}`,
}));

export default function MarketplacePage() {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-[1408px] mx-auto px-4 sm:px-0">
      <div className="mb-4 animate-[fade-up_0.4s_ease-out_both]">
        <p className="text-sm text-muted-foreground mb-1">
          Welcome back, {user?.givenName || user?.username}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Pokemon
        </h1>
      </div>

      <div className="flex flex-wrap gap-5 sm:gap-6 md:gap-8">
        {PLACEHOLDER_CARDS.map((card, i) => (
          <Card
            key={card.id}
            className="w-full sm:w-40 md:w-48 lg:w-56 xl:w-64 gap-0 py-0 overflow-hidden transition-colors hover:border-primary/50 cursor-pointer shrink-0 animate-[fade-up_0.4s_ease-out_both]"
            style={{ animationDelay: `${0.05 * i}s` }}
          >
            <CardHeader className="px-4 py-2.5 sm:px-3 sm:py-2.5 flex items-center">
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {card.lister.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] sm:text-xs font-medium truncate">
                    {card.listerName}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                    @{card.lister}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-xs sm:text-sm">
                  Image
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-center items-start px-4 py-2.5 sm:px-3 sm:py-2.5 gap-0">
              <p className="text-xs sm:text-sm font-medium truncate w-full leading-tight">
                {card.name}
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-primary leading-tight">
                ${card.price}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
