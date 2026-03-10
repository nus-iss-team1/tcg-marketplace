import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProfileHeaderProps {
  title: string;
  username?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  backHref?: string;
}

export function ProfileHeader({
  title,
  username,
  badge,
  action,
  backHref,
}: ProfileHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 animate-[fade-up_0.4s_ease-out_both]">
      <div className="flex items-center gap-3 min-w-0">
        {backHref && (
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
            <Link href={backHref}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              {title}
            </h1>
            {badge}
          </div>
          {username && (
            <p className="text-sm text-muted-foreground">@{username}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
