/* ── PageHeader ─────────────────────────────────────────────── */

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col items-center gap-4 animate-[fade-up_0.4s_ease-out_both]">
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
    <div className="flex flex-1 flex-col w-full max-w-480 mx-auto px-4 sm:px-0 min-h-0">
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
