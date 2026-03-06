import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { MarketplaceRepository } from "./marketplace.repository";
import { CreateListingDto } from "./dto/create-listing.dto";
import { QueryListingCursor } from "./types/marketplace.type";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { ulid } from "ulid";

@Injectable()
export class MarketplaceService {
  constructor(private readonly marketplaceRepo: MarketplaceRepository) {}

  async create(listing: CreateListingDto) {
    // generate listingId
    listing.listingId = ulid();

    // include timestamp
    const currentTs = DateTime.now().toMillis();
    listing.createdAt = currentTs;
    listing.updatedAt = currentTs;

    // other mandatory fields
    listing.listingStatus = "ACTIVE";

    return await this.marketplaceRepo.createListing(listing);
  }

  async listing(gameName: string, limit: number, cursor: QueryListingCursor | undefined) {
    return await this.marketplaceRepo.retrieveListing(gameName, limit, cursor);
  }

  async sellerListing(sellerId: string, limit: number, cursor: QueryListingCursor | undefined) {
    return await this.marketplaceRepo.retrieveSellerListing(sellerId, limit, cursor);
  }

  async update(listingId: string, listing: UpdateListingDto) {
    // include timestamp
    listing.updatedAt = DateTime.now().toMillis();

    return await this.marketplaceRepo.updateListing(listingId, listing);
  }

  async remove(listingId: string) {
    return await this.marketplaceRepo.deleteListing(listingId);
  }
}
