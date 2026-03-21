import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CognitoAuthGuard } from "../auth/cognito-auth.guard";
import { Public } from "../auth/public.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { MarketplaceService } from "./marketplace.service";
import {
  CreateListingDto,
  QueryListingDto,
  QuerySellerListingDto,
  UpdateListingDto
} from "./dto/marketplace.dto";
import { ImageUploadPipe } from "./pipes/image-validation.pipe";
import { MAX_SIZE } from "../s3/constants/s3.constant";
import { MultipartJsonInterceptor } from "./interceptors/multipart-json.Interceptor";
import { ImageAction } from "./types/marketplace.type";

@UseGuards(CognitoAuthGuard)
@Controller("marketplace")
export class MarketplaceController {
  private readonly imagePipe = new ImageUploadPipe();

  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "frontImage", maxCount: 1 },
        { name: "backImage", maxCount: 1 }
      ],
      {
        limits: {
          fileSize: MAX_SIZE
        }
      }
    ),
    MultipartJsonInterceptor
  )
  async create(
    @CurrentUser("cognito:username") username: string,
    @UploadedFiles()
    files: {
      frontImage?: Express.Multer.File[];
      backImage?: Express.Multer.File[];
    },
    @Body() listing: CreateListingDto
  ) {
    const frontImage = this.imagePipe.transform(files.frontImage?.[0]);
    const backImage = this.imagePipe.transform(files.backImage?.[0]);

    if (!frontImage) {
      throw new BadRequestException("frontImage is required");
    }

    return await this.marketplaceService.createListing(username, listing, frontImage, backImage);
  }

  @Public()
  @Get(":gameName")
  async listing(@Param("gameName") gameName: string, @Query() query?: QueryListingDto) {
    return await this.marketplaceService.listing(gameName, query);
  }

  @Public()
  @Get("profile/:sellerId")
  async sellerListing(@Param("sellerId") sellerId: string, @Query() query?: QuerySellerListingDto) {
    return await this.marketplaceService.sellerListing(sellerId, query);
  }

  @Public()
  @Get(":gameName/:listingId")
  async specificListing(
    @Param("gameName") gameName: string,
    @Param("listingId") listingId: string
  ) {
    return await this.marketplaceService.specificListing(gameName, listingId);
  }

  @Patch(":gameName/:listingId")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "frontImage", maxCount: 1 },
        { name: "backImage", maxCount: 1 }
      ],
      {
        limits: {
          fileSize: MAX_SIZE
        }
      }
    ),
    MultipartJsonInterceptor
  )
  async update(
    @CurrentUser("cognito:username") username: string,
    @CurrentUser("cognito:groups") role: string[],
    @UploadedFiles()
    files: {
      frontImage?: Express.Multer.File[];
      backImage?: Express.Multer.File[];
    },
    @Param("gameName") gameName: string,
    @Param("listingId") listingId: string,
    @Body() listing: UpdateListingDto
  ) {
    const frontImage = this.imagePipe.transform(files.frontImage?.[0]);
    const backImage = this.imagePipe.transform(files.backImage?.[0]);

    if (listing.frontImageAction === ImageAction.REPLACE && !frontImage) {
      throw new BadRequestException("Missing frontImage");
    }
    if (listing.backImageAction === ImageAction.REPLACE && !backImage) {
      throw new BadRequestException("Missing backImage");
    }

    return await this.marketplaceService.updateListing(
      username,
      role,
      gameName,
      listingId,
      listing,
      frontImage,
      backImage
    );
  }

  @Delete(":gameName/:listingId")
  async delete(
    @CurrentUser("cognito:username") username: string,
    @CurrentUser("cognito:groups") role: string[],
    @Param("gameName") gameName: string,
    @Param("listingId") listingId: string
  ) {
    return await this.marketplaceService.deleteListing(username, role, gameName, listingId);
  }
}
