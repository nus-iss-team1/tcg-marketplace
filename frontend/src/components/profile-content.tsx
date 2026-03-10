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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EmptyState } from "@/components/empty-state";
import { MapPinIcon, CalendarIcon } from "lucide-react";
import { fetchSellerListings, type Listing } from "@/lib/listings";

export interface ProfileData {
  username: string;
  displayName: string;
  joinedAt?: number;
  address?: string;
}

interface ProfileContentProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
  action?: React.ReactNode;
}

export function ProfileContent({ profile, isOwnProfile, action }: ProfileContentProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(listings.length / 15) || 1;

  const initials = profile.displayName
    ? profile.displayName.substring(0, 2).toUpperCase()
    : profile.username.substring(0, 2).toUpperCase();

  useEffect(() => {
    let cancelled = false;
    fetchSellerListings(profile.username)
      .then((res) => { if (!cancelled) setListings(res.listings); })
      .finally(() => { if (!cancelled) setLoadingListings(false); });
    return () => { cancelled = true; };
  }, [profile.username]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Profile meta */}
      <div className="flex items-center justify-between animate-[fade-up_0.4s_ease-out_both]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {profile.address && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPinIcon className="h-3 w-3" />
              {profile.address}
            </span>
          )}
          {profile.joinedAt && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              Joined {new Date(profile.joinedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {action}
      </div>

      <Separator />

      {/* Listings section */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 animate-[fade-up_0.4s_ease-out_both]" style={{ animationDelay: "0.1s" }}>
          Listings ({listings.length})
        </h3>

        {loadingListings ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            title="No listings yet"
            description={
              isOwnProfile
                ? "You haven't created any listings yet."
                : "This user hasn't listed any cards yet."
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
              {listings.map((listing, i) => (
                <Link key={listing.listingId} href="/listing/sample">
                  <Card
                    className="gap-0 py-0 overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:scale-105 cursor-pointer animate-[fade-up_0.4s_ease-out_both]"
                    style={{ animationDelay: `${0.05 * i + 0.15}s` }}
                  >
                    <CardHeader className="px-4 py-2.5 sm:px-3 sm:py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Avatar className="h-5 w-5 shrink-0">
                          <AvatarFallback className="text-[10px]">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] sm:text-xs font-medium truncate">
                            {profile.displayName}
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
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-4 w-24" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
