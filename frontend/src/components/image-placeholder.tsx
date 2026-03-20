"use client";

import { useId } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  className?: string;
  seed?: string;
}

export function ImagePlaceholder({ className, seed }: ImagePlaceholderProps) {
  const id = useId();
  const s = seed ?? id;
  return (
    <div className={cn("aspect-5/7 bg-muted overflow-hidden", className)}>
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
