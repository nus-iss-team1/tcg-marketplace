import { cn } from "@/lib/utils";

interface CardFanProps {
  className?: string;
  animated?: boolean;
}

function CardShape({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 rounded-xl border-2 flex flex-col overflow-hidden", className)}>
      <div className="flex-1 m-[2px] mb-[1px] rounded-lg bg-background/70" />
      <div className="h-1/3 m-[2px] mt-[1px] rounded-lg bg-background/70" />
    </div>
  );
}

export function CardFan({ className, animated = true }: CardFanProps) {
  const anim = animated ? "animate" : "no-animate";

  return (
    <div className={cn("relative", className)}>
      {/* Far left */}
      <CardShape
        className={cn(
          "origin-bottom border-foreground/30 bg-foreground/60",
          anim === "animate" && "animate-[fan-left-2_0.7s_ease-out_0.4s_both]"
        )}
      />
      {/* Left */}
      <CardShape
        className={cn(
          "origin-bottom border-foreground/50 bg-foreground/80",
          anim === "animate" && "animate-[fan-left-1_0.7s_ease-out_0.2s_both]"
        )}
      />
      {/* Center */}
      <div className={cn(
        "absolute inset-0 origin-bottom rounded-xl border-2 border-foreground bg-foreground shadow-2xl flex flex-col overflow-hidden z-10",
        animated && "animate-[fan-center_0.7s_ease-out_both]"
      )}>
        <div className="flex-1 m-[2px] mb-[1px] rounded-lg bg-background" />
        <div className="h-1/3 m-[2px] mt-[1px] rounded-lg bg-background" />
      </div>
      {/* Right */}
      <CardShape
        className={cn(
          "origin-bottom border-foreground/50 bg-foreground/80",
          anim === "animate" && "animate-[fan-right-1_0.7s_ease-out_0.2s_both]"
        )}
      />
      {/* Far right */}
      <CardShape
        className={cn(
          "origin-bottom border-foreground/30 bg-foreground/60",
          anim === "animate" && "animate-[fan-right-2_0.7s_ease-out_0.4s_both]"
        )}
      />
    </div>
  );
}
