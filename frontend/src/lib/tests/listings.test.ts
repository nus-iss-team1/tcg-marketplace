import { fetchMarketplaceListings, fetchSellerListings } from "@/lib/listings";

describe("fetchMarketplaceListings", () => {
  it("returns listings for a game", async () => {
    const result = await fetchMarketplaceListings("Pokemon TCG");
    expect(result.listings.length).toBeGreaterThan(0);
    expect(result.cursor).toBeDefined();
  });

  it("respects limit param", async () => {
    const result = await fetchMarketplaceListings("Pokemon TCG", { limit: 5 });
    expect(result.listings).toHaveLength(5);
  });

  it("generates unique listing IDs", async () => {
    const result = await fetchMarketplaceListings("Pokemon TCG");
    const ids = result.listings.map((l) => l.listingId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("generates listings with correct structure", async () => {
    const result = await fetchMarketplaceListings("Pokemon TCG");
    const listing = result.listings[0];

    expect(listing).toHaveProperty("listingId");
    expect(listing).toHaveProperty("sellerId");
    expect(listing).toHaveProperty("sellerName");
    expect(listing).toHaveProperty("gameName");
    expect(listing).toHaveProperty("cardName");
    expect(listing).toHaveProperty("price");
    expect(listing).toHaveProperty("updatedAt");
  });

  it("generates valid prices", async () => {
    const result = await fetchMarketplaceListings("Pokemon TCG");
    result.listings.forEach((listing) => {
      const price = parseFloat(listing.price);
      expect(price).toBeGreaterThan(0);
    });
  });

  it("sets correct gameName for all listings", async () => {
    const result = await fetchMarketplaceListings("Yu-Gi-Oh!");
    result.listings.forEach((listing) => {
      expect(listing.gameName).toBe("Yu-Gi-Oh!");
    });
  });
});

describe("fetchSellerListings", () => {
  it("returns listings for a seller", async () => {
    const result = await fetchSellerListings("seller1");
    expect(result.listings.length).toBeGreaterThan(0);
  });

  it("sets sellerId correctly for all listings", async () => {
    const result = await fetchSellerListings("seller1");
    result.listings.forEach((listing) => {
      expect(listing.sellerId).toBe("seller1");
    });
  });

  it("respects limit param", async () => {
    const result = await fetchSellerListings("seller1", { limit: 3 });
    expect(result.listings.length).toBeLessThanOrEqual(3);
  });
});
