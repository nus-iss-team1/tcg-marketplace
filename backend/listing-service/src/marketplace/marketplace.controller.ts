import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";
import { Public } from "../auth/public.decorator";
import { CreateListingDto } from "./dto/create-listing.dto";
import { QueryListingDto } from "./dto/query-listing.dto";
import { QueryListingCursor } from "./types/marketplace.type";
import { UpdateListingDto } from "./dto/update-listing.dto";

@Controller("marketplace")
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Public()
  @Post()
  async create(@Body() listing: CreateListingDto) {
    return await this.marketplaceService.create(listing);
  }

  @Public()
  @Get(":gameName")
  async listing(@Param("gameName") gameName: string, @Query() query: QueryListingDto) {
    const limit = query.limit ?? 50;
    const cursor: QueryListingCursor | undefined = query.cursor
      ? (JSON.parse(Buffer.from(query.cursor, "base64").toString()) as QueryListingCursor)
      : undefined;

    const result = await this.marketplaceService.listing(gameName, limit, cursor);
    return {
      data: result.items,
      pagination: {
        nextCursor: result.nextCursor
          ? Buffer.from(JSON.stringify(result.nextCursor)).toString("base64")
          : null,
        limit: limit
      }
    };
  }

  @Public()
  @Get("profile/:sellerId")
  async sellerListing(@Param("sellerId") sellerId: string, @Query() query: QueryListingDto) {
    const limit = query.limit ?? 50;
    const cursor: QueryListingCursor | undefined = query.cursor
      ? (JSON.parse(Buffer.from(query.cursor, "base64").toString()) as QueryListingCursor)
      : undefined;

    const result = await this.marketplaceService.sellerListing(sellerId, limit, cursor);
    return {
      data: result.items,
      pagination: {
        nextCursor: result.nextCursor
          ? Buffer.from(JSON.stringify(result.nextCursor)).toString("base64")
          : null,
        limit: limit
      }
    };
  }

  // @Roles("User")
  @Public()
  @Patch(":listingId")
  async update(@Param("listingId") listingId: string, @Body() listing: UpdateListingDto) {
    return await this.marketplaceService.update(listingId, listing);
  }

  @Public()
  @Delete(":listingId")
  async remove(@Param("listingId") listingId: string) {
    return await this.marketplaceService.remove(listingId);
  }
}
