const BASE_URL = "";
const USE_MOCK = true;

/* ── Mock data ── */

const MOCK_SELLERS = [
  { id: "seller1", name: "CardMaster" },
  { id: "seller2", name: "PokeFanatic" },
  { id: "seller3", name: "DuelKing" },
  { id: "seller4", name: "TCGTrader" },
  { id: "seller5", name: "RareFinds" },
];

const MOCK_CARDS: Record<string, { cardName: string; setName: string; rarity: string; cardId: string }[]> = {
  "Pokemon TCG": [
    { cardName: "Charizard VMAX", setName: "Darkness Ablaze", rarity: "Ultra Rare", cardId: "020/189" },
    { cardName: "Pikachu V", setName: "Vivid Voltage", rarity: "Rare", cardId: "043/185" },
    { cardName: "Mewtwo GX", setName: "Shining Legends", rarity: "Secret Rare", cardId: "076/073" },
    { cardName: "Umbreon VMAX", setName: "Evolving Skies", rarity: "Alt Art", cardId: "215/203" },
    { cardName: "Lugia V", setName: "Silver Tempest", rarity: "Ultra Rare", cardId: "138/195" },
    { cardName: "Rayquaza VMAX", setName: "Evolving Skies", rarity: "Alt Art", cardId: "218/203" },
    { cardName: "Gengar VMAX", setName: "Fusion Strike", rarity: "Ultra Rare", cardId: "271/264" },
    { cardName: "Mew VMAX", setName: "Fusion Strike", rarity: "Secret Rare", cardId: "269/264" },
  ],
  "Yu-Gi-Oh!": [
    { cardName: "Blue-Eyes White Dragon", setName: "Legend of Blue Eyes", rarity: "Ultra Rare", cardId: "LOB-001" },
    { cardName: "Dark Magician", setName: "Starter Deck Yugi", rarity: "Ultra Rare", cardId: "SDY-006" },
    { cardName: "Exodia the Forbidden One", setName: "Legend of Blue Eyes", rarity: "Ultra Rare", cardId: "LOB-124" },
    { cardName: "Red-Eyes Black Dragon", setName: "Legend of Blue Eyes", rarity: "Ultra Rare", cardId: "LOB-070" },
    { cardName: "Ash Blossom & Joyous Spring", setName: "Maximum Crisis", rarity: "Secret Rare", cardId: "MACR-036" },
  ],
  "Magic: The Gathering": [
    { cardName: "Black Lotus", setName: "Alpha", rarity: "Rare", cardId: "ALB-232" },
    { cardName: "Jace, the Mind Sculptor", setName: "Worldwake", rarity: "Mythic Rare", cardId: "WWK-031" },
    { cardName: "Liliana of the Veil", setName: "Innistrad", rarity: "Mythic Rare", cardId: "ISD-105" },
    { cardName: "Ragavan, Nimble Pilferer", setName: "Modern Horizons 2", rarity: "Mythic Rare", cardId: "MH2-138" },
  ],
  "Digimon Card Game": [
    { cardName: "Omnimon", setName: "BT05 Battle of Omni", rarity: "Secret Rare", cardId: "BT5-086" },
    { cardName: "Gallantmon", setName: "EX02 Digital Hazard", rarity: "Super Rare", cardId: "EX2-039" },
  ],
  "One Piece Card Game": [
    { cardName: "Monkey D. Luffy", setName: "Romance Dawn", rarity: "Leader", cardId: "OP01-003" },
    { cardName: "Roronoa Zoro", setName: "Romance Dawn", rarity: "Super Rare", cardId: "OP01-025" },
  ],
  "Star Wars Unlimited": [
    { cardName: "Darth Vader", setName: "Spark of Rebellion", rarity: "Legendary", cardId: "SOR-010" },
    { cardName: "Luke Skywalker", setName: "Spark of Rebellion", rarity: "Legendary", cardId: "SOR-005" },
  ],
};

function generateMockListings(gameName: string, count: number, sellerId?: string): Listing[] {
  const cards = MOCK_CARDS[gameName] ?? MOCK_CARDS["Pokemon TCG"]!;
  return Array.from({ length: count }, (_, i) => {
    const card = cards[i % cards.length]!;
    const seller = sellerId
      ? { id: sellerId, name: sellerId }
      : MOCK_SELLERS[i % MOCK_SELLERS.length]!;
    return {
      listingId: `${gameName.replace(/\s+/g, "-").toLowerCase()}-${String(i + 1).padStart(4, "0")}`,
      sellerId: seller.id,
      sellerName: seller.name,
      gameName,
      cardId: card.cardId,
      cardName: card.cardName,
      setName: card.setName,
      rarity: card.rarity,
      price: (Math.random() * 200 + 1).toFixed(2),
      listingStatus: "ACTIVE",
      updatedAt: Date.now() - i * 3600000,
    };
  });
}

function mockFetchListings(gameName: string, params?: FetchListingsParams): FetchListingsResponse {
  const limit = params?.limit ?? 15;
  const listings = generateMockListings(gameName, limit);
  return { listings, cursor: btoa(`mock-cursor-${limit}`) };
}

function mockFetchSellerListings(sellerId: string, params?: FetchListingsParams): FetchListingsResponse {
  const limit = params?.limit ?? 10;
  const games = Object.keys(MOCK_CARDS);
  const listings = games.flatMap((game) => generateMockListings(game, 2, sellerId)).slice(0, limit);
  return { listings, cursor: btoa(`mock-seller-cursor-${limit}`) };
}

export interface Listing {
  listingId: string;
  sellerId: string;
  sellerName: string;
  gameName: string;
  cardId?: string;
  cardName: string;
  setName?: string;
  rarity?: string;
  price: string;
  paymentMethod?: PaymentMethod;
  pickup?: string;
  listingStatus?: "ACTIVE" | "SOLD" | "DELETED";
  images?: string[];
  updatedAt: number;
}

export interface PaymentMethod {
  cash: boolean;
  paynow: boolean;
  bank: boolean;
}

export interface FetchListingsParams {
  limit?: number;
  cursor?: string;
  sort?: string;
  order?: string;
}

export interface FetchListingsResponse {
  listings: Listing[];
  cursor?: string;
}

export interface CreateListingBody {
  gameName: string;
  cardName: string;
  setName?: string;
  cardId?: string;
  rarity?: string;
  price: number;
  paymentMethod?: PaymentMethod;
  pickup?: string;
  listingStatus?: "ACTIVE" | "SOLD" | "DELETED";
}

export type UpdateListingBody = Omit<CreateListingBody, "gameName">;

/* ── GET /api/marketplace/<gameName> ── */

export async function fetchMarketplaceListings(
  gameName: string,
  params?: FetchListingsParams
): Promise<FetchListingsResponse> {
  if (USE_MOCK) return mockFetchListings(gameName, params);

  const url = new URL(`${BASE_URL}/api/marketplace/${encodeURIComponent(gameName)}`);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.cursor) url.searchParams.set("cursor", params.cursor);
  if (params?.sort) url.searchParams.set("sort", params.sort);
  if (params?.order) url.searchParams.set("order", params.order);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

/* ── GET /api/marketplace/profile/<sellerId> ── */

export async function fetchSellerListings(
  sellerId: string,
  params?: FetchListingsParams
): Promise<FetchListingsResponse> {
  if (USE_MOCK) return mockFetchSellerListings(sellerId, params);

  const url = new URL(`${BASE_URL}/api/marketplace/profile/${encodeURIComponent(sellerId)}`);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.cursor) url.searchParams.set("cursor", params.cursor);
  if (params?.sort) url.searchParams.set("sort", params.sort);
  if (params?.order) url.searchParams.set("order", params.order);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch seller listings");
  return res.json();
}

/* ── POST /api/marketplace ── */

export async function createListing(body: CreateListingBody): Promise<Listing> {
  const res = await fetch(`${BASE_URL}/api/marketplace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create listing");
  return res.json();
}

/* ── POST /api/marketplace/<listingId> ── */

export async function updateListing(
  listingId: string,
  body: UpdateListingBody
): Promise<Listing> {
  const res = await fetch(`${BASE_URL}/api/marketplace/${encodeURIComponent(listingId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update listing");
  return res.json();
}

/* ── DELETE /api/marketplace/<listingId> ── */

export async function deleteListing(listingId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/marketplace/${encodeURIComponent(listingId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete listing");
}
