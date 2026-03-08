export type QueryListingCursor = {
  gameName: string;
  updatedAt: number;
};

export enum SortListing {
  updatedAt = "updatedAt",
  cardName = "cardName",
  price = "price"
}

export enum OrderListing {
  ASC = "ASC",
  DESC = "DESC"
}

export type QueryListing = {
  limit: number;
  cursor?: QueryListingCursor;
  sort: SortListing;
  order: boolean;
  index: string;
};

export type ListingAttachment = {
  front: string;
  back: string;
};

export type ListingPaymentMethod = {
  cash: boolean;
  paynow: boolean;
  bank: boolean;
};

export enum ListingStatus {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED",
  SOLD = "SOLD"
}
