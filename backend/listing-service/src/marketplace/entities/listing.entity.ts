import { ListingAttachment, ListingPaymentMethod, ListingStatus } from "../types/marketplace.type";

export interface ListingEntity {
  // table pk
  gameName: string;

  // pk of gsi SellerListingIndex - sk: listingUpdatedAt
  sellerId: string;

  // table sk
  listingId: string;

  // value: <updatedAt>#<listingId>
  listingUpdatedAt: string;

  // sk of gsi CardListingIndex - pk: gameName
  // value: <cardName>#<listingId>
  listingCardName: string;

  // sk of gsi PriceListingIndex - pk: gameName
  // value: <paddedPrice>#<listingId>
  listingPrice: string;

  cardName: string;
  setName?: string;
  cardId?: string;
  rarity?: string;
  price: number;
  attachment?: ListingAttachment;
  paymentMethod?: ListingPaymentMethod;
  pickUp?: string;
  listingStatus: ListingStatus;
  createdAt: number;
  updatedAt: number;
}
