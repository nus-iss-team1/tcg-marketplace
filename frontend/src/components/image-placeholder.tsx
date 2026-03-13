import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  className?: string;
}

export function ImagePlaceholder({ className }: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "aspect-3/4 bg-muted flex items-center justify-center",
        className
      )}
    >
      <span className="text-muted-foreground text-xs sm:text-sm">Image</span>
    </div>
  );
}
