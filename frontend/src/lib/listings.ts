const BASE_URL = "";
const USE_MOCK = true;

/* ── Mock data ── */

const MOCK_SELLERS: { id: string; name: string; address?: string; joinedAt?: number }[] = [
  { id: "seller1", name: "CardMaster", address: "Jurong East, Singapore", joinedAt: Date.now() - 120 * 86400000 },
  { id: "seller2", name: "PokeFanatic", address: "Orchard, Singapore", joinedAt: Date.now() - 90 * 86400000 },
  { id: "seller3", name: "DuelKing", address: "Tampines, Singapore", joinedAt: Date.now() - 60 * 86400000 },
  { id: "super_long_username_overflow_test", name: "TheUltimateCardCollectorAndTrader", address: "Bukit Timah, Singapore", joinedAt: Date.now() - 30 * 86400000 },
  { id: "x", name: "A", joinedAt: Date.now() - 7 * 86400000 },
];

const MOCK_CARDS: Record<string, { cardName: string; setName: string; rarity: string; cardId: string }[]> = {
  "Pokemon TCG": [
    { cardName: "Charizard VMAX Rainbow Rare Full Art Alternate", setName: "Sword & Shield Darkness Ablaze Booster", rarity: "Illustration Rare Secret", cardId: "020/189" },
    { cardName: "Pikachu V", setName: "Vivid Voltage", rarity: "Rare", cardId: "043/185" },
    { cardName: "Mewtwo GX", setName: "Shining Legends", rarity: "Secret Rare", cardId: "076/073" },
    { cardName: "Umbreon VMAX Alternate Art Special Illustration", setName: "Evolving Skies", rarity: "Special Art Rare", cardId: "215/203" },
    { cardName: "Lugia V", setName: "Silver Tempest", rarity: "Ultra Rare", cardId: "138/195" },
    { cardName: "Rayquaza VMAX", setName: "Evolving Skies", rarity: "Alt Art", cardId: "218/203" },
    { cardName: "Gengar VMAX", setName: "Fusion Strike", rarity: "Ultra Rare", cardId: "271/264" },
    { cardName: "Mew VMAX", setName: "Fusion Strike", rarity: "Secret Rare", cardId: "269/264" },
  ],
  "Yu-Gi-Oh!": [
    { cardName: "Blue-Eyes White Dragon", setName: "Legend of Blue Eyes White Dragon 25th Anniversary Edition", rarity: "Ultra Rare Ghost Quarter Century Secret", cardId: "LOB-EN001" },
    { cardName: "Dark Magician", setName: "Starter Deck Yugi", rarity: "Ultra Rare", cardId: "SDY-006" },
    { cardName: "Exodia the Forbidden One", setName: "Legend of Blue Eyes", rarity: "Ultra Rare", cardId: "LOB-124" },
    { cardName: "Red-Eyes Black Dragon", setName: "Legend of Blue Eyes", rarity: "Ultra Rare", cardId: "LOB-070" },
    { cardName: "Ash Blossom & Joyous Spring", setName: "Maximum Crisis", rarity: "Secret Rare", cardId: "MACR-036" },
  ],
  "Magic: The Gathering": [
    { cardName: "Black Lotus", setName: "Alpha", rarity: "Rare", cardId: "ALB-232" },
    { cardName: "Jace, the Mind Sculptor (Borderless Alternate Art)", setName: "Worldwake Masters Remastered", rarity: "Mythic Rare", cardId: "WWK-031" },
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
      createdAt: Date.now() - i * 7200000,
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

/* ── Card types ── */

export interface CardType {
  label: string;
  value: string;
}

export async function getCardTypes(): Promise<CardType[]> {
  return [
    { label: "Pokemon TCG", value: "Pokemon TCG" },
    { label: "Yu-Gi-Oh!", value: "Yu-Gi-Oh!" },
    { label: "Magic: The Gathering", value: "Magic: The Gathering" },
    { label: "Digimon", value: "Digimon Card Game" },
    { label: "One Piece", value: "One Piece Card Game" },
    { label: "Star Wars", value: "Star Wars Unlimited" },
  ];
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
  pickUp?: string;
  listingStatus?: "ACTIVE" | "SOLD" | "DELETED";
  attachment?: ListingAttachment;
  createdAt: number;
  updatedAt: number;
}

export interface ListingAttachment {
  front?: string;
  back?: string;
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
  pickUp?: string;
  listingStatus?: "ACTIVE" | "SOLD" | "DELETED";
}

export type UpdateListingBody = Omit<CreateListingBody, "gameName">;

export interface SellerProfile {
  username: string;
  displayName: string;
  address?: string;
  joinedAt?: number;
}

function mockFetchSellerProfile(sellerId: string): SellerProfile | null {
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (!seller) return { username: sellerId, displayName: sellerId };
  return {
    username: seller.id,
    displayName: seller.name,
    address: seller.address,
    joinedAt: seller.joinedAt,
  };
}

/* ── GET /api/marketplace/profile/<sellerId> (profile) ── */

export async function fetchSellerProfile(
  sellerId: string
): Promise<SellerProfile | null> {
  if (USE_MOCK) return mockFetchSellerProfile(sellerId);

  const res = await fetch(`${BASE_URL}/api/marketplace/profile/${encodeURIComponent(sellerId)}`);
  if (!res.ok) return null;
  return res.json();
}

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
