export interface Listing {
  listingId: string;
  sellerId: string;
  sellerName: string;
  gameName: string;
  cardId: string;
  cardName: string;
  price: string;
  updatedAt: number;
}

export interface FetchListingsResponse {
  listings: Listing[];
  totalPages: number;
}

const ITEMS_PER_PAGE = 15;
const TOTAL_ITEMS = 60;

export interface MarketplaceParams {
  game?: string;
  query?: string;
  page?: number;
}

export function fetchMarketplaceListings(params: MarketplaceParams): FetchListingsResponse {
  // TODO: Replace with actual API call
  // e.g. request({ baseUrl: API_URL, path: "/marketplace", method: "GET", params })
  return fetchListings(params.page ?? 1);
}

export function fetchListings(page: number): FetchListingsResponse {
  const totalPages = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
  const count = page === totalPages
    ? TOTAL_ITEMS - (totalPages - 1) * ITEMS_PER_PAGE
    : ITEMS_PER_PAGE;

  // TODO: Replace with actual API call
  const listings: Listing[] = Array.from({ length: count }, (_, i) => {
    const idx = (page - 1) * ITEMS_PER_PAGE + i;
    return {
      listingId: `listing-${String(idx + 1).padStart(4, "0")}`,
      sellerId: `seller${(idx % 10) + 1}`,
      sellerName: `Seller ${(idx % 10) + 1}`,
      gameName: "Pokemon",
      cardId: `card-${String(idx + 1).padStart(4, "0")}`,
      cardName: `Pikachu V #${String(idx + 1).padStart(3, "0")}`,
      price: (Math.random() * 100 + 1).toFixed(2),
      updatedAt: Date.now() - idx * 60000,
    };
  });

  return { listings, totalPages };
}
