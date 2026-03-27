import { getAccessToken } from "@/lib/cognito";

const BASE_URL = "";
const USE_MOCK = process.env.NODE_ENV === "test";

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

export function fetchSampleListing(): Listing {
  const listing = generateMockListings("Pokemon TCG", 1)[0]!;
  listing.attachment = {
    ...listing.attachment,
    images: [
      "https://picsum.photos/seed/card1/512/683",
      "https://picsum.photos/seed/card2/512/683",
      "https://picsum.photos/seed/card3/512/683",
      "https://picsum.photos/seed/card4/512/683",
      "https://picsum.photos/seed/card5/512/683",
    ],
  };
  return listing;
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

const MOCK_CARD_TYPES: CardType[] = [
  { label: "Pokemon TCG", value: "Pokemon TCG" },
  { label: "Yu-Gi-Oh!", value: "Yu-Gi-Oh!" },
  { label: "Magic: The Gathering", value: "Magic: The Gathering" },
  { label: "Digimon", value: "Digimon Card Game" },
  { label: "One Piece", value: "One Piece Card Game" },
  { label: "Star Wars", value: "Star Wars Unlimited" },
];

export async function getCardTypes(): Promise<CardType[]> {
  if (USE_MOCK) return MOCK_CARD_TYPES;

  try {
    const res = await fetch(`${BASE_URL}/api/listing/reference/game`);
    if (!res.ok) {
      console.error(`Failed to fetch card types: ${res.status} ${res.statusText}`);
      return [];
    }
    const json = await res.json();
    return (json.data ?? json ?? []).map((g: { gameName: string }) => ({
      label: g.gameName,
      value: g.gameName,
    }));
  } catch (err) {
    console.error("Failed to fetch card types:", err);
    return [];
  }
}

/* ── GET /api/listing/reference/card ── */

export interface CardNameResult {
  cardName: string;
  gameName: string;
}

/* ── Card Image Lookup (external APIs) ── */

async function fetchPokemonImage(cardName: string): Promise<string | null> {
  try {
    const cleanName = cardName.replace(/\s*\(.*?\)\s*/g, "").trim();
    const res = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(cleanName)}`);
    if (!res.ok) return null;
    const json = await res.json();
    const match = json?.find((c: { image?: string }) => c.image);
    return match?.image ? `${match.image}/low.webp` : null;
  } catch {
    return null;
  }
}

async function fetchYugiohImage(cardName: string): Promise<string | null> {
  try {
    const cleanName = cardName.replace(/\s*\(.*?\)\s*/g, "").trim();
    const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(cleanName)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0]?.card_images?.[0]?.image_url_small ?? json.data?.[0]?.card_images?.[0]?.image_url ?? null;
  } catch {
    return null;
  }
}

async function fetchMtgImage(cardName: string): Promise<string | null> {
  try {
    const cleanName = cardName.replace(/\s*\(.*?\)\s*/g, "").trim();
    const res = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cleanName)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.image_uris?.small ?? json.image_uris?.normal ?? null;
  } catch {
    return null;
  }
}

const CARD_IMAGE_FETCHERS: Record<string, (cardName: string) => Promise<string | null>> = {
  "Pokemon TCG": fetchPokemonImage,
  "Yu-Gi-Oh!": fetchYugiohImage,
  "Magic: The Gathering": fetchMtgImage,
};

export async function fetchCardImage(gameName: string, cardName: string): Promise<string | null> {
  const fetcher = CARD_IMAGE_FETCHERS[gameName];
  if (!fetcher) return null;
  return fetcher(cardName);
}

export async function fetchCardNames(
  gameName: string,
  cardName?: string
): Promise<CardNameResult[]> {
  const query = new URLSearchParams({ gameName });
  if (cardName) query.set("cardName", cardName);
  const res = await fetch(`${BASE_URL}/api/listing/reference/card?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch card names");
  const json = await res.json();
  return json.data ?? json ?? [];
}

/* ── GET /api/listing/marketplace/{gameName}/{listingId} ── */

export async function fetchSpecificListing(
  gameName: string,
  listingId: string
): Promise<Listing> {
  const res = await fetch(
    `${BASE_URL}/api/listing/marketplace/${encodeURIComponent(gameName)}/${encodeURIComponent(listingId)}`
  );
  if (!res.ok) throw new Error("Failed to fetch listing");
  const json = await res.json();
  return json.data ?? json;
}

export interface Listing {
  listingId: string;
  sellerId?: string;
  sellerName?: string;
  gameName: string;
  cardId?: string;
  cardName: string;
  title?: string;
  description?: string;
  setName?: string;
  rarity?: string;
  price: string;
  paymentMethod?: PaymentMethod;
  pickUp?: string;
  listingStatus?: "ACTIVE" | "SOLD" | "DELETED";
  thumbnail?: string;
  attachment?: ListingAttachment;
  createdAt: number;
  updatedAt: number;
}

export interface ListingAttachment {
  front?: string;
  back?: string;
  images?: string[];
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
  filter?: "title" | "cardName" | "sellerId";
  filterValue?: string;
}

export interface FetchListingsResponse {
  listings: Listing[];
  cursor?: string;
}

export interface CreateListingBody {
  gameName: string;
  cardName: string;
  title: string;
  description?: string;
  setName?: string;
  cardId?: string;
  rarity?: string;
  price: number;
  paymentMethod?: PaymentMethod;
  pickup?: string;
  pickUp?: string;
  listingStatus?: "ACTIVE" | "SOLD" | "DELETED";
  frontImage?: File;
  backImage?: File;
}

export interface UpdateListingBody {
  cardName?: string;
  title?: string;
  description?: string;
  setName?: string;
  cardId?: string;
  rarity?: string;
  price?: number;
  paymentMethod?: PaymentMethod;
  pickup?: string;
  pickUp?: string;
  listingStatus?: "ACTIVE" | "SOLD" | "DELETED";
  frontImage?: File;
  backImage?: File;
  frontImageAction?: "REPLACE" | "KEEP";
  backImageAction?: "REPLACE" | "DELETE" | "KEEP";
}

export interface SellerProfile {
  username: string;
  displayName: string;
  address?: string;
  joinedAt?: number;
  bio?: string;
  preferredPayment?: {
    cash: boolean;
    paynow: boolean;
    bank: boolean;
  };
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

/* ── GET /api/listing/profile/<userId> ── */

export async function fetchSellerProfile(
  userId: string
): Promise<SellerProfile | null> {
  if (USE_MOCK) return mockFetchSellerProfile(userId);

  const res = await fetch(`${BASE_URL}/api/listing/profile/${encodeURIComponent(userId)}`);
  if (!res.ok) return null;
  const json = await res.json();
  return {
    username: json.userId,
    displayName: json.displayName,
    address: json.address,
    joinedAt: json.joinedAt,
    bio: json.bio,
    preferredPayment: json.preferredPayment,
  };
}

/* ── PATCH /api/listing/profile ── */

export interface UpdateProfileBody {
  displayName?: string;
  address?: string;
  bio?: string;
  preferredPayment?: {
    cash: boolean;
    paynow: boolean;
    bank: boolean;
  };
}

export async function updateSellerProfile(body: UpdateProfileBody): Promise<SellerProfile> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/listing/profile`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  const json = await res.json();
  return {
    username: json.userId,
    displayName: json.displayName,
    address: json.address,
    joinedAt: json.joinedAt,
    bio: json.bio,
    preferredPayment: json.preferredPayment,
  };
}

/* ── GET /api/listing/marketplace/<gameName> ── */

export async function fetchMarketplaceListings(
  gameName: string,
  params?: FetchListingsParams
): Promise<FetchListingsResponse> {
  if (USE_MOCK) return mockFetchListings(gameName, params);

  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.sort) query.set("sort", params.sort);
  if (params?.order) query.set("order", params.order);
  if (params?.filter) query.set("filter", params.filter);
  if (params?.filterValue) query.set("filterValue", params.filterValue);
  const qs = query.toString();
  const url = `${BASE_URL}/api/listing/marketplace/${encodeURIComponent(gameName)}${qs ? `?${qs}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch listings");
  const json = await res.json();
  return {
    listings: json.data ?? json.listings ?? [],
    cursor: json.pagination?.nextCursor ?? json.cursor,
  };
}

/* ── GET /api/listing/marketplace/profile/<sellerId> ── */

export async function fetchSellerListings(
  sellerId: string,
  params?: FetchListingsParams
): Promise<FetchListingsResponse> {
  if (USE_MOCK) return mockFetchSellerListings(sellerId, params);

  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.sort) query.set("sort", params.sort);
  if (params?.order) query.set("order", params.order);
  const qs = query.toString();
  const url = `${BASE_URL}/api/listing/marketplace/profile/${encodeURIComponent(sellerId)}${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { headers: await authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch seller listings");
  const json = await res.json();
  return {
    listings: json.data ?? json.listings ?? [],
    cursor: json.pagination?.nextCursor ?? json.cursor,
  };
}

/* ── POST /api/listing/marketplace (multipart/form-data) ── */

export async function createListing(body: CreateListingBody): Promise<Listing> {
  const formData = new FormData();
  formData.append("gameName", body.gameName);
  formData.append("cardName", body.cardName);
  formData.append("title", body.title);
  formData.append("price", String(body.price));
  if (body.description) formData.append("description", body.description);
  if (body.setName) formData.append("setName", body.setName);
  if (body.cardId) formData.append("cardId", body.cardId);
  if (body.rarity) formData.append("rarity", body.rarity);
  if (body.pickup) formData.append("pickup", body.pickup);
  if (body.pickUp) formData.append("pickUp", body.pickUp);
  if (body.listingStatus) formData.append("listingStatus", body.listingStatus);
  formData.append("paymentMethod", JSON.stringify(body.paymentMethod ?? { cash: true, paynow: false, bank: false }));
  if (body.frontImage) formData.append("frontImage", body.frontImage);
  if (body.backImage) formData.append("backImage", body.backImage);

  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/listing/marketplace`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Create listing failed:", res.status, err);
    throw new Error("Failed to create listing");
  }
  return res.json();
}

/* ── PATCH /api/listing/marketplace/<gameName>/<listingId> (multipart/form-data) ── */

export interface UpdateListingRequest {
  gameName: string;
  listingId: string;
  body: UpdateListingBody;
}

export async function updateListing(request: UpdateListingRequest): Promise<Listing> {
  const { gameName, listingId, body } = request;
  if (!gameName) throw new Error("gameName is required");
  if (!listingId) throw new Error("listingId is required");
  const formData = new FormData();
  if (body.cardName) formData.append("cardName", body.cardName);
  if (body.title) formData.append("title", body.title);
  if (body.description) formData.append("description", body.description);
  if (body.setName) formData.append("setName", body.setName);
  if (body.cardId) formData.append("cardId", body.cardId);
  if (body.rarity) formData.append("rarity", body.rarity);
  if (body.price != null) formData.append("price", String(body.price));
  if (body.pickup) formData.append("pickup", body.pickup);
  if (body.pickUp) formData.append("pickUp", body.pickUp);
  if (body.listingStatus) formData.append("listingStatus", body.listingStatus);
  if (body.paymentMethod) formData.append("paymentMethod", JSON.stringify(body.paymentMethod));
  if (body.frontImage) formData.append("frontImage", body.frontImage);
  if (body.backImage) formData.append("backImage", body.backImage);
  if (body.frontImageAction) formData.append("frontImageAction", body.frontImageAction);
  if (body.backImageAction) formData.append("backImageAction", body.backImageAction);

  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/listing/marketplace/${encodeURIComponent(gameName)}/${encodeURIComponent(listingId)}`, {
    method: "PATCH",
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to update listing");
  return res.json();
}

/* ── DELETE /api/listing/marketplace/<gameName>/<listingId> ── */

export interface DeleteListingRequest {
  gameName: string;
  listingId: string;
}

export async function deleteListing(request: DeleteListingRequest): Promise<void> {
  const { gameName, listingId } = request;
  if (!gameName) throw new Error("gameName is required");
  if (!listingId) throw new Error("listingId is required");

  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/listing/marketplace/${encodeURIComponent(gameName)}/${encodeURIComponent(listingId)}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete listing");
}
