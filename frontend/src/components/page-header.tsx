import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageContainerProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
  children: React.ReactNode;
  centered?: boolean;
}

export function PageContainer({
  title,
  description,
  action,
  backHref,
  children,
  centered,
}: PageContainerProps) {
  return (
    <div className="flex flex-1 flex-col w-full max-w-352 mx-auto px-4 sm:px-0">
      <div className="mb-4 flex items-center justify-between gap-4 animate-[fade-up_0.4s_ease-out_both]">
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <Button variant="outline" size="icon" className="h-8 w-8 sm:w-auto sm:px-3 shrink-0" asChild>
              <Link href={backHref}>
                <ChevronLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
          )}
          <div className="min-w-0">
            {description && (
              <p className="text-sm text-muted-foreground mb-1">{description}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              {title}
            </h1>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {centered ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
