import { buildProjection } from "../../dynamodb/dynamodb.util";
import { TCGMarketplaceSchema } from "./marketplace.schema";

type ListingKey = keyof typeof TCGMarketplaceSchema;

const ListingViews = {
  overview: [
    "gameName",
    "sellerId",
    "listingId",
    "title",
    "cardName",
    "price",
    "thumbnail",
    "listingStatus",
    "updatedAt"
  ],
  specificListing: [
    "gameName",
    "sellerId",
    "listingId",
    "title",
    "description",
    "cardName",
    "setName",
    "cardId",
    "rarity",
    "price",
    "attachment",
    "paymentMethod",
    "pickUp",
    "listingStatus",
    "createdAt",
    "updatedAt"
  ]
} as const satisfies Record<string, readonly ListingKey[]>;

export const ListingProjections = {
  overview: buildProjection(TCGMarketplaceSchema, ListingViews.overview),
  specificListing: buildProjection(TCGMarketplaceSchema, ListingViews.specificListing)
};
