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
import { CreateListingDto, QueryListingDto, UpdateListingDto } from "./dto/marketplace.dto";
import { ImageUploadPipe } from "./pipes/image-validation.pipe";
import { MAX_SIZE } from "../s3/constants/s3.constant";
import { MultipartJsonInterceptor } from "./interceptors/multipart-json.Interceptor";

@UseGuards(CognitoAuthGuard)
@Controller("marketplace")
export class MarketplaceController {
  private readonly imagePipe = new ImageUploadPipe();

  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Public()
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
    @CurrentUser("email") username: string,
    @UploadedFiles()
    files: {
      frontImage?: Express.Multer.File[];
      backImage?: Express.Multer.File[];
    },
    @Body() listing: CreateListingDto
  ) {
    if (!files.frontImage) {
      throw new BadRequestException("frontImage is required");
    }

    const frontImage = this.imagePipe.transform(files.frontImage[0]);
    const backImage = this.imagePipe.transform(files.backImage?.[0]);

    return await this.marketplaceService.createListing("jaryl.o", listing, frontImage, backImage);
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
    @CurrentUser("email") username: string,
    @UploadedFiles()
    files: {
      frontImage?: Express.Multer.File[];
      backImage?: Express.Multer.File[];
    },
    @Param("listingId") listingId: string,
    @Body() listing: UpdateListingDto
  ) {
    const frontImage = this.imagePipe.transform(files.frontImage?.[0]);
    const backImage = this.imagePipe.transform(files.backImage?.[0]);

    return await this.marketplaceService.updateListing(
      "chew.jingkai",
      listingId,
      listing,
      frontImage,
      backImage
    );
  }

  @Public()
  @Delete(":listingId")
  async delete(@CurrentUser("email") username: string, @Param("listingId") listingId: string) {
    return await this.marketplaceService.deleteListing(username, listingId);
  }
}
