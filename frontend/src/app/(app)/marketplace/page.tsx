"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth } from "@/context/AuthContext";

const ITEMS_PER_PAGE = 15;
const TOTAL_ITEMS = 60;
const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);

interface Listing {
  listingId: string;
  sellerId: string;
  sellerName: string;
  gameName: string;
  cardId: string;
  cardName: string;
  price: string;
  updatedAt: number;
}

const generateListings = (page: number): Listing[] => {
  const count = page === TOTAL_PAGES
    ? TOTAL_ITEMS - (TOTAL_PAGES - 1) * ITEMS_PER_PAGE
    : ITEMS_PER_PAGE;
  return Array.from({ length: count }, (_, i) => {
    const idx = (page - 1) * ITEMS_PER_PAGE + i;
    return {
      listingId: `listing-${String(idx + 1).padStart(4, "0")}`,
      sellerId: `seller${(idx % 10) + 1}`,
      sellerName: `Seller ${(idx % 10) + 1}`,
      gameName: "Pokemon",
      cardId: `card-${String(idx + 1).padStart(4, "0")}`,
      cardName: `Pikachu V #${String(idx + 1).padStart(3, "0")}`,
      price: (Math.random() * 100 + 1).toFixed(2),
      updatedAt: Date.now() - idx * 60000,
    };
  });
};

export default function MarketplacePage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const listings = generateListings(currentPage);

  return (
    <div className="w-full max-w-352 mx-auto px-4 sm:px-0">
      <div className="mb-4 animate-[fade-up_0.4s_ease-out_both]">
        <p className="text-sm text-muted-foreground mb-1">
          Welcome back, {user?.givenName || user?.username}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Pokemon
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
        {listings.map((listing, i) => (
          <Card
            key={listing.listingId}
            className="gap-0 py-0 overflow-hidden transition-colors hover:border-primary/50 cursor-pointer animate-[fade-up_0.4s_ease-out_both]"
            style={{ animationDelay: `${0.05 * i}s` }}
          >
            <CardHeader className="px-4 py-2.5 sm:px-3 sm:py-2.5 flex items-center">
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {listing.sellerId.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] sm:text-xs font-medium truncate">
                    {listing.sellerName}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                    @{listing.sellerId}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-4/3 w-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-xs sm:text-sm">
                  Image
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-center items-start px-4 py-2.5 sm:px-3 sm:py-2.5 gap-0.5">
              <p className="text-xs sm:text-sm font-medium truncate w-full leading-tight">
                {listing.cardName}
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-primary leading-tight">
                ${listing.price}
              </p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">
                {new Date(listing.updatedAt).toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((page) => {
            if (
              page === 1 ||
              page === TOTAL_PAGES ||
              Math.abs(page - currentPage) <= 1
            ) {
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            if (page === 2 && currentPage > 3) {
              return (
                <PaginationItem key="start-ellipsis">
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            if (page === TOTAL_PAGES - 1 && currentPage < TOTAL_PAGES - 2) {
              return (
                <PaginationItem key="end-ellipsis">
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return null;
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < TOTAL_PAGES) setCurrentPage(currentPage + 1);
              }}
              className={currentPage === TOTAL_PAGES ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
