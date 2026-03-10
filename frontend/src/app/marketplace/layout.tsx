"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { SearchButton, SearchOverlay } from "@/components/search-overlay";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader>
        <SearchButton onClick={() => setSearchOpen(true)} />
      </AppHeader>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <main className="flex flex-1 flex-col items-center p-4 sm:p-5 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}
