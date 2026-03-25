import { type ComponentType } from "react";
import { WorldsBanner } from "@/components/worlds-banner";

const GAME_BANNERS: Record<string, ComponentType> = {
  "Pokemon TCG": WorldsBanner,
};

export function GameBanner({ game }: { game: string }) {
  const Banner = GAME_BANNERS[game];
  if (!Banner) return null;
  return (
    <div className="w-full mb-6 overflow-hidden rounded-lg">
      <Banner />
    </div>
  );
}
