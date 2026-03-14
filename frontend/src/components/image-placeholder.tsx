import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  className?: string;
  seed?: string;
}

export function ImagePlaceholder({ className, seed }: ImagePlaceholderProps) {
  const s = seed ?? Math.random().toString(36).slice(2, 8);
  return (
    <div className={cn("aspect-3/4 bg-muted overflow-hidden", className)}>
      <Image
        src={`https://picsum.photos/seed/${s}/512/683`}
        alt="Placeholder"
        width={512}
        height={683}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
