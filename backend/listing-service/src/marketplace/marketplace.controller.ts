import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards
} from "@nestjs/common";
import { CognitoAuthGuard } from "../auth/cognito-auth.guard";
import { Public } from "../auth/public.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { MarketplaceService } from "./marketplace.service";
import { CreateListingDto, QueryListingDto, UpdateListingDto } from "./dto/marketplace.dto";

@UseGuards(CognitoAuthGuard)
@Controller("marketplace")
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Public()
  @Post()
  async create(@CurrentUser("email") username: string, @Body() listing: CreateListingDto) {
    return await this.marketplaceService.createListing(username, listing);
  }

  @Public()
  @Get(":gameName")
  async listing(@Param("gameName") gameName: string, @Query() query?: QueryListingDto) {
    return await this.marketplaceService.listing(gameName, query);
  }

  @Public()
  @Get("profile/:sellerId")
  async sellerListing(@Param("sellerId") sellerId: string, @Query() query?: QueryListingDto) {
    return await this.marketplaceService.sellerListing(sellerId, query);
  }

  // @Roles("User")
  @Public()
  @Patch(":listingId")
  async update(
    @CurrentUser("email") username: string,
    @Param("listingId") listingId: string,
    @Body() listing: UpdateListingDto
  ) {
    return await this.marketplaceService.updateListing(username, listingId, listing);
  }

  @Public()
  @Delete(":listingId")
  async delete(@CurrentUser("email") username: string, @Param("listingId") listingId: string) {
    return await this.marketplaceService.deleteListing(username, listingId);
  }
}
