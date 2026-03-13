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
    <div className="mb-6 flex flex-col items-center gap-4 animate-[fade-up_0.4s_ease-out_both]">
      {backHref && (
        <Button variant="outline" size="icon" className="h-8 w-8 self-start" asChild>
          <Link href={backHref}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
      )}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-lg sm:text-xl">
            {title}
          </h1>
          {badge}
        </div>
        {username && (
          <p className="text-xs text-muted-foreground">@{username}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
