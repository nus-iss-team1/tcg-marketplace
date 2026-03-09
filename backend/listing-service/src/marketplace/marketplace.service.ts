import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { ulid } from "ulid";
import { MarketplaceRepository } from "./marketplace.repository";
import {
  ListingStatus,
  OrderListing,
  QueryListing,
  QueryListingCursor,
  SortListing
} from "./types/marketplace.type";
import { Listing } from "./types/marketplace.schema";
import { padPrice } from "../common/utils/common.utils";
import { CreateListingDto, QueryListingDto, UpdateListingDto } from "./dto/marketplace.dto";

@Injectable()
export class MarketplaceService {
  constructor(private readonly marketplaceRepo: MarketplaceRepository) {}

  private configureQuery(query?: QueryListingDto) {
    const limit = query?.limit ?? 50;
    const cursor: QueryListingCursor | undefined = query?.cursor
      ? (JSON.parse(Buffer.from(query.cursor, "base64").toString()) as QueryListingCursor)
      : undefined;

    const sortMap: Record<SortListing, SortListing> = {
      [SortListing.cardName]: SortListing.cardName,
      [SortListing.price]: SortListing.price,
      [SortListing.updatedAt]: SortListing.updatedAt
    };
    const orderMap: Record<OrderListing, boolean> = {
      [OrderListing.ASC]: true,
      [OrderListing.DESC]: false
    };
    const indexMap: Record<SortListing, string> = {
      [SortListing.cardName]: "UpdatedListingIndex",
      [SortListing.price]: "CardListingIndex",
      [SortListing.updatedAt]: "PriceListingIndex"
    };

    const newQuery: QueryListing = {
      limit: limit,
      cursor: cursor,
      sort: query?.sort ? sortMap[query.sort] : SortListing.updatedAt,
      order: query?.order ? orderMap[query.order] : true,
      index: query?.sort ? indexMap[query.sort] : "UpdatedListingIndex"
    };

    return newQuery;
  }

  async createListing(sellerId: string, listing: CreateListingDto) {
    // generate listingId
    listing.listingId = ulid();

    // include timestamp
    const currentTs = DateTime.now().toMillis();
    listing.createdAt = currentTs;
    listing.updatedAt = currentTs;

    // other mandatory fields
    listing.sellerId = sellerId;
    listing.listingStatus = ListingStatus.ACTIVE;

    // combine together
    const paddedPrice = padPrice(listing.price);
    const newListing: Listing = {
      ...listing,
      listingUpdatedAt: `${listing.updatedAt}#${listing.listingId}`.toLowerCase(),
      listingCardName: `${listing.cardName}#${listing.listingId}`.toLowerCase(),
      listingPrice: `${paddedPrice}#${listing.listingId}`.toLowerCase()
    };

    return await this.marketplaceRepo.createListing(newListing);
  }

  async listing(gameName: string, query?: QueryListingDto) {
    const newQuery = this.configureQuery(query);
    const result = await this.marketplaceRepo.retrieveListing(gameName, newQuery);

    return {
      data: result.items,
      pagination: {
        nextCursor: result.nextCursor
          ? Buffer.from(JSON.stringify(result.nextCursor)).toString("base64")
          : null,
        limit: newQuery.limit
      }
    };
  }

  async sellerListing(sellerId: string, query?: QueryListingDto) {
    const newQuery = this.configureQuery(query);
    const result = await this.marketplaceRepo.retrieveSellerListing(sellerId, newQuery);

    return {
      data: result.items,
      pagination: {
        nextCursor: result.nextCursor
          ? Buffer.from(JSON.stringify(result.nextCursor)).toString("base64")
          : null,
        limit: newQuery.limit
      }
    };
  }

  async updateListing(sellerId: string, listingId: string, listing: UpdateListingDto) {
    // include timestamp
    listing.updatedAt = DateTime.now().toMillis();

    return await this.marketplaceRepo.updateListing(sellerId, listingId, listing);
  }

  async deleteListing(sellerId: string, listingId: string) {
    return await this.marketplaceRepo.deleteListing(sellerId, listingId);
  }
}
