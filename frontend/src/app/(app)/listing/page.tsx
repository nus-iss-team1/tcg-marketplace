"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-header";
import { PlusIcon } from "lucide-react";
import { fetchSellerListings, type Listing } from "@/lib/listings";

export default function MyListingsPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [listings, setListings] = useState<Listing[]>([]);
  const totalPages = Math.ceil(listings.length / 15) || 1;

  useEffect(() => {
    document.title = "My Listings - TCG Marketplace";
  }, []);

  useEffect(() => {
    if (user?.username) {
      fetchSellerListings(user.username).then((res) => setListings(res.listings));
    }
  }, [user?.username]);

  const initials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "?";

  return (
    <PageContainer
      title="My Listings"
      description="Manage your cards"
      action={
        <Button asChild size="icon" className="h-8 w-8 sm:w-auto sm:px-3">
          <Link href="/listing/create">
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">New Listing</span>
          </Link>
        </Button>
      }
    >
      {listings.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="You haven't created any listings yet. Start selling your cards!"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
            {listings.map((listing, i) => (
              <Link key={listing.listingId} href="/listing/sample">
              <Card
                className="gap-0 py-0 overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:scale-105 cursor-pointer animate-[fade-up_0.4s_ease-out_both]"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                <CardHeader className="px-4 py-2.5 sm:px-3 sm:py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] sm:text-xs font-medium truncate">
                        {user?.givenName || user?.username}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 shrink-0">
                    {listing.gameName}
                  </Badge>
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
              </Link>
            ))}
          </div>

          <div className="h-14 sm:hidden" />

          <Pagination className="mt-8 sticky bottom-2 sm:static bg-background/40 backdrop-blur-md py-3 sm:py-0 sm:bg-transparent sm:backdrop-blur-none rounded-full sm:rounded-none mx-2 sm:mx-0">
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
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
                if (page === totalPages - 1 && currentPage < totalPages - 2) {
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
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </PageContainer>
  );
}
