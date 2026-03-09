import { fetchListings } from "@/lib/listings";

describe("fetchListings", () => {
  it("returns 15 items for page 1", () => {
    const result = fetchListings(1);
    expect(result.listings).toHaveLength(15);
    expect(result.totalPages).toBe(4);
  });

  it("returns 15 items for page 2", () => {
    const result = fetchListings(2);
    expect(result.listings).toHaveLength(15);
  });

  it("returns remaining items for the last page", () => {
    const result = fetchListings(4);
    expect(result.listings).toHaveLength(15);
  });

  it("returns correct totalPages", () => {
    const result = fetchListings(1);
    expect(result.totalPages).toBe(4);
  });

  it("generates unique listing IDs", () => {
    const result = fetchListings(1);
    const ids = result.listings.map((l) => l.listingId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("generates listings with correct structure", () => {
    const result = fetchListings(1);
    const listing = result.listings[0];

    expect(listing).toHaveProperty("listingId");
    expect(listing).toHaveProperty("sellerId");
    expect(listing).toHaveProperty("sellerName");
    expect(listing).toHaveProperty("gameName");
    expect(listing).toHaveProperty("cardId");
    expect(listing).toHaveProperty("cardName");
    expect(listing).toHaveProperty("price");
    expect(listing).toHaveProperty("updatedAt");
  });

  it("generates valid prices", () => {
    const result = fetchListings(1);
    result.listings.forEach((listing) => {
      const price = parseFloat(listing.price);
      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThanOrEqual(101);
    });
  });

  it("sets gameName to Pokemon for all listings", () => {
    const result = fetchListings(1);
    result.listings.forEach((listing) => {
      expect(listing.gameName).toBe("Pokemon");
    });
  });

  it("generates different listing IDs across pages", () => {
    const page1 = fetchListings(1);
    const page2 = fetchListings(2);
    const ids1 = page1.listings.map((l) => l.listingId);
    const ids2 = page2.listings.map((l) => l.listingId);

    ids2.forEach((id) => {
      expect(ids1).not.toContain(id);
    });
  });
});
