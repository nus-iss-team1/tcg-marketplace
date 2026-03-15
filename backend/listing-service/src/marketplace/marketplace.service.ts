import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  LoggerService
} from "@nestjs/common";
import { DateTime } from "luxon";
import { ulid } from "ulid";
import { S3Service } from "../s3/s3.service";
import { MarketplaceRepository } from "./marketplace.repository";
import {
  ImageAction,
  ListingAttachment,
  ListingStatus,
  OrderListing,
  QueryListing,
  QueryListingCursor,
  SortListing
} from "./types/marketplace.type";
import { Listing } from "./types/marketplace.schema";
import { padPrice } from "../common/utils/common.utils";
import { CreateListingDto, QueryListingDto, UpdateListingDto } from "./dto/marketplace.dto";
import { IMAGE_FOLDER, THUMBNAIL_FOLDER } from "../s3/constants/s3.constant";
import { LoggingService } from "../logger/logging.service";

@Injectable()
export class MarketplaceService {
  private logger: LoggerService;

  constructor(
    loggingService: LoggingService,
    private readonly s3Service: S3Service,
    private readonly marketplaceRepo: MarketplaceRepository
  ) {
    this.logger = loggingService.getLogger();
  }

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
      order: query?.order ? orderMap[query.order] : false,
      index: query?.sort ? indexMap[query.sort] : "UpdatedListingIndex"
    };

    return newQuery;
  }

  async createListing(
    sellerId: string,
    listing: CreateListingDto,
    frontImage?: Express.Multer.File,
    backImage?: Express.Multer.File
  ) {
    const listingId = ulid();
    const currentTs = DateTime.now().toMillis();
    const paddedPrice = padPrice(listing.price);

    const attachment: ListingAttachment = {
      front: "",
      back: ""
    };

    try {
      let thumbnail = "";
      // upload image to s3
      if (frontImage) {
        const [frontKey, thumbnailKey] = await this.s3Service.uploadImage(
          frontImage,
          listingId,
          true
        );
        attachment.front = frontKey;
        thumbnail = thumbnailKey;
      }

      if (backImage) {
        const [backKey, _] = await this.s3Service.uploadImage(backImage, listingId, false);
        attachment.back = backKey;
      }

      const newListing: Listing = {
        ...listing,
        listingId: listingId,
        createdAt: currentTs,
        updatedAt: currentTs,
        sellerId: sellerId,
        attachment: attachment,
        thumbnail: thumbnail,
        listingStatus: ListingStatus.ACTIVE,
        listingUpdatedAt: `${currentTs}#${listingId}`.toLowerCase(),
        listingCardName: `${listing.cardName}#${listingId}`.toLowerCase(),
        listingPrice: `${paddedPrice}#${listingId}`.toLowerCase()
      };

      // write into database
      return await this.marketplaceRepo.createListing(newListing);
    } catch (err) {
      this.logger.error(err);

      try {
        await this.s3Service.deleteObject(`${IMAGE_FOLDER}/${listingId}/`);
        await this.s3Service.deleteObject(`${THUMBNAIL_FOLDER}/${listingId}/`);
      } catch (err) {
        this.logger.error(err);
        throw new InternalServerErrorException("Failed to delete file");
      }
    }
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

  async updateListing(
    sellerId: string,
    listingId: string,
    listing: UpdateListingDto,
    frontImage?: Express.Multer.File,
    backImage?: Express.Multer.File
  ) {
    // check if record exist and sellerId is owner of the record
    const result = (await this.marketplaceRepo.retrieveSpecificListing(
      sellerId,
      listingId
    )) as Listing[];

    if (result.length !== 0) {
      const { frontImageAction, backImageAction, ...updatedField } = listing;
      const oldRecord = result[0];
      const uploadedKeys: string[] = [];
      const attachment: ListingAttachment = {
        front: oldRecord.attachment.front,
        back: oldRecord.attachment.back
      };
      let thumbnail = oldRecord.thumbnail;
      let updatedListing: Listing;

      try {
        // replace image in s3
        if (frontImageAction === ImageAction.REPLACE && frontImage) {
          const [frontKey, thumbnailKey] = await this.s3Service.uploadImage(
            frontImage,
            listingId,
            true
          );
          attachment.front = frontKey;
          thumbnail = thumbnailKey;
          uploadedKeys.push(attachment.front);
          uploadedKeys.push(thumbnail);
        }
        if (backImageAction === ImageAction.REPLACE && backImage) {
          const [backKey, _] = await this.s3Service.uploadImage(backImage, listingId, false);
          attachment.back = backKey;
          uploadedKeys.push(attachment.back);
        }

        if (frontImageAction === ImageAction.DELETE) {
          attachment.front = "";
          oldRecord.thumbnail = attachment.front;
        }
        if (backImageAction === ImageAction.DELETE) {
          attachment.back = "";
        }

        // replace old record with new changes
        const cardName = updatedField.cardName ? updatedField.cardName : oldRecord.cardName;
        const currentTs = DateTime.now().toMillis();
        const paddedPrice = padPrice(listing.price);
        const modifiedListing: Listing = {
          ...oldRecord,
          ...updatedField,
          listingUpdatedAt: `${currentTs}#${listingId}`.toLowerCase(),
          listingCardName: `${cardName}#${listingId}`.toLowerCase(),
          listingPrice: `${paddedPrice}#${listingId}`.toLowerCase(),
          cardName: cardName,
          attachment: attachment,
          thumbnail: thumbnail,
          listingId: listingId,
          updatedAt: currentTs
        };

        // update record in database table
        updatedListing = await this.marketplaceRepo.updateListing(modifiedListing);
      } catch (err) {
        this.logger.error(err);

        // revert newly uploaded images
        await Promise.all(uploadedKeys.map((key) => this.s3Service.deleteObject(key)));

        // revert update on database
        await this.marketplaceRepo.updateListing(oldRecord);

        throw new InternalServerErrorException("Unexpected error occurred while update listing");
      }

      // delete old images
      if (
        (frontImageAction === ImageAction.REPLACE || frontImageAction === ImageAction.DELETE) &&
        oldRecord.attachment.front
      ) {
        await this.s3Service.deleteObject(oldRecord.attachment.front);
        await this.s3Service.deleteObject(oldRecord.thumbnail);
      }
      if (
        (backImageAction === ImageAction.REPLACE || backImageAction === ImageAction.DELETE) &&
        oldRecord.attachment.back
      ) {
        await this.s3Service.deleteObject(oldRecord.attachment.back);
      }

      return updatedListing;
    } else {
      throw new ForbiddenException("Record doesn't exist or unauthorized");
    }
  }

  async deleteListing(sellerId: string, listingId: string) {
    // check if sellerId is owner of the record
    const result = (await this.marketplaceRepo.retrieveSpecificListing(
      sellerId,
      listingId
    )) as Listing[];

    if (result.length !== 0) {
      const record = result[0];

      // include timestamp
      record.updatedAt = DateTime.now().toMillis();

      return await this.marketplaceRepo.deleteListing(record);
    } else {
      throw new ForbiddenException("Record doesn't exist or unauthorized");
    }
  }
}
