import { Skeleton } from "@/components/ui/skeleton";

interface ListingGridSkeletonProps {
  count?: number;
}

export function ListingGridSkeleton({ count = 10 }: ListingGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-[fade-up_0.4s_ease-out_both]"
          style={{ animationDelay: `${0.05 * i}s` }}
        >
          <Skeleton className="aspect-5/7 w-full rounded-none" />
          <div className="mt-2 space-y-1">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
