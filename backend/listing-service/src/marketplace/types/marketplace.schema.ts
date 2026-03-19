import { field } from "../../dynamodb/dynamodb.util";
import { ListingAttachment, ListingPaymentMethod, ListingStatus } from "./marketplace.type";

export const TCGMarketplaceSchema = {
  gameName: field({
    type: "string",
    pk: true,
    gsi: {
      CardListingIndex: "pk",
      PriceListingIndex: "pk"
    }
  }),
  sellerId: field({
    type: "string",
    gsi: {
      SellerListingIndex: "pk"
    }
  }),
  listingId: field({
    type: "string",
    sk: true
  }),
  listingUpdatedAt: field({
    type: "string",
    gsi: { SellerListingIndex: "sk" },
    hidden: true
  }), // value: <updatedAt>#<listingId>
  listingCardName: field({
    type: "string",
    gsi: { CardListingIndex: "sk" },
    hidden: true
  }), // value: <cardName>#<listingId>
  listingPrice: field({
    type: "string",
    gsi: { PriceListingIndex: "sk" },
    hidden: true
  }), // value: <paddedPrice>#<listingId>
  filterSellerId: field({
    type: "string",
    hidden: true
  }), // value: <sellerId>#<listingId>
  filterTitle: field({
    type: "string",
    hidden: true
  }), // value: <title>#<listingId>
  title: field({
    type: "string"
  }),
  description: field({
    type: "string",
    optional: true
  }),
  cardName: field({
    type: "string"
  }),
  setName: field({
    type: "string",
    optional: true
  }),
  cardId: field({
    type: "string",
    optional: true
  }),
  rarity: field({
    type: "string",
    optional: true
  }),
  price: field({
    type: "number"
  }),
  attachment: field({
    type: "list",
    attribute: {
      front: "string",
      back: "string"
    },
    optional: true
  }),
  thumbnail: field({
    type: "string"
  }),
  paymentMethod: field({
    type: "list",
    attribute: {
      cash: "boolean",
      paynow: "boolean",
      bank: "boolean"
    },
    optional: true
  }),
  pickUp: field({
    type: "string",
    optional: true
  }),
  listingStatus: field({
    type: "string"
  }),
  createdAt: field({
    type: "number"
  }),
  updatedAt: field({
    type: "number"
  })
};

export type Listing = {
  gameName: string;
  sellerId: string;
  listingId: string;
  listingUpdatedAt: string;
  listingCardName: string;
  listingPrice: string;
  filterSellerId: string;
  filterTitle: string;
  title: string;
  description?: string;
  cardName: string;
  setName?: string;
  cardId?: string;
  rarity?: string;
  price: number;
  attachment: ListingAttachment;
  thumbnail: string;
  paymentMethod?: ListingPaymentMethod;
  pickUp?: string;
  listingStatus: ListingStatus;
  createdAt: number;
  updatedAt: number;
};
