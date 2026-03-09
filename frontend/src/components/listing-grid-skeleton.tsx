import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ListingGridSkeletonProps {
  count?: number;
}

export function ListingGridSkeleton({ count = 10 }: ListingGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="gap-0 py-0 overflow-hidden animate-[fade-up_0.4s_ease-out_both]"
          style={{ animationDelay: `${0.05 * i}s` }}
        >
          <CardHeader className="px-4 py-2.5 sm:px-3 sm:py-2.5 flex items-center">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Skeleton className="aspect-4/3 w-full rounded-none" />
          </CardContent>
          <CardFooter className="flex flex-col items-start px-4 py-2.5 sm:px-3 sm:py-2.5 gap-1">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-2.5 w-16" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
