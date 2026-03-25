import Image from "next/image";

export function WorldsBanner() {
  return (
    <div className="relative w-full overflow-visible pb-20 sm:pb-24 md:pb-28">
      {/* Gradient background — fixed height */}
      <div className="w-full h-48 sm:h-56 md:h-64 rounded-lg animate-[fade-in_0.8s_ease-out_both]" style={{ background: "linear-gradient(to bottom, transparent, #46c1e0 30%, #dee7c6 70%, transparent)" }} />

      {/* Character art — positioned to overlap below the gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl animate-[fade-up_0.8s_ease-out_0.2s_both]">
        <Image
          src="/images/key_art_off.webp"
          alt="Pokémon World Championships Anaheim"
          width={1652}
          height={1226}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Anaheim sign */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 sm:w-48 md:w-56 z-10 animate-[fade-up_0.6s_ease-out_0.5s_both]">
        <Image
          src="/images/anaheim_2025_blue.webp"
          alt="Anaheim 2025"
          width={400}
          height={200}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
