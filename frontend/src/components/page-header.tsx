import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* ── PageHeader ─────────────────────────────────────────────── */

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
}

export function PageHeader({
  title,
  description,
  action,
  backHref,
}: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col items-center gap-4 animate-[fade-up_0.4s_ease-out_both]">
      {backHref && (
        <Button variant="outline" size="icon" className="h-8 w-8 self-start" asChild>
          <Link href={backHref}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
      )}
      <div className="text-center">
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        <h1 className="text-lg sm:text-xl">
          {title}
        </h1>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ── PageContainer ──────────────────────────────────────────── */

interface PageContainerProps {
  children: React.ReactNode;
  centered?: boolean;
}

export function PageContainer({ children, centered }: PageContainerProps) {
  return (
    <div className="flex flex-1 flex-col w-full max-w-352 mx-auto px-4 sm:px-0 min-h-0">
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
