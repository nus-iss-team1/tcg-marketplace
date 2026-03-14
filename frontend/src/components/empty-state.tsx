interface EmptyStateProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title = "Nothing here yet",
  description = "There are no items to display.",
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[50vh] text-center animate-[fade-up_0.4s_ease-out_both]">
      <h3 className="text-lg sm:text-xl mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-5 max-w-sm">
        {description}
      </p>
      {children}
    </div>
  );
}
