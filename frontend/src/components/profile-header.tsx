interface ProfileHeaderProps {
  title: string;
  username?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export function ProfileHeader({
  title,
  username,
  badge,
  action,
}: ProfileHeaderProps) {
  return (
    <div className="mb-6 flex flex-col items-center gap-4 animate-[fade-up_0.4s_ease-out_both]">
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
