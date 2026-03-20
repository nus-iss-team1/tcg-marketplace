import { cn } from "@/lib/utils";

interface ContentLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentLayout({ children, className }: ContentLayoutProps) {
  return (
    <div className={cn("px-0 sm:px-4 md:px-12 lg:px-24 xl:px-48", className)}>
      {children}
    </div>
  );
}
