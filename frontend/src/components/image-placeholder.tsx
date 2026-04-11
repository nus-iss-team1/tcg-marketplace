"use client";

import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  className?: string;
  cardName?: string;
  gameName?: string;
  seed?: string;
}

export function ImagePlaceholder({ className }: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "aspect-5/7 overflow-hidden flex flex-col items-center justify-center bg-neutral-100",
        className
      )}
    >
      <ImageIcon className="w-8 h-8 text-black/15" />
      <p className="mt-2 text-[10px] text-black/20 uppercase tracking-widest">
        No Image
      </p>
    </div>
  );
}
