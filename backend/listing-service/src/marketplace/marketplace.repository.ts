import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { DYNAMODB_CLIENT } from "../dynamodb/dynamodb.constants";
import { ListingEntity } from "./entities/listing.entity";
import { QueryListing } from "./types/marketplace.type";
import { getDtoKeys } from "./utils/marketplace.util";
import { CreateListingDto, UpdateListingDto } from "./dto/marketplace.dto";
import { handleDynamoError } from "../common/utils/common.utils";

@Injectable()
export class MarketplaceRepository {
  private readonly tableName = "TCGMarketplace";
  private attributeExp: string;
  private attributeName: Record<string, string>;

  constructor(
    @Inject(DYNAMODB_CLIENT)
    private readonly docClient: DynamoDBDocumentClient
  ) {
    // extract only specific attributes from the table to be displayed
    const keys = getDtoKeys(CreateListingDto);
    this.attributeExp = keys.map((k) => `#${k}`).join(", ");
    this.attributeName = Object.fromEntries(keys.map((k) => [`#${k}`, k]));
  }

  private async validateIsSellerListing(sellerId: string, listingId: string) {
    try {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: "SellerListingIndex",
          KeyConditionExpression: "sellerId = :sellerId",
          FilterExpression: "listingId = :listingId AND listingStatus <> :listingStatus",
          ExpressionAttributeValues: {
            ":sellerId": sellerId,
            ":listingId": listingId,
            ":listingStatus": "DELETED"
          }
        })
      );

      return result.Items ?? [];
    } catch (err) {
      handleDynamoError(err);
    }
  }

  async createListing(listing: ListingEntity) {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: listing
        })
      );

      // retrieve created result
      const result = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            gameName: listing.gameName,
            listingId: listing.listingId
          },
          ProjectionExpression: this.attributeExp,
          ExpressionAttributeNames: this.attributeName
        })
      );
      return result.Item;
    } catch (err) {
      handleDynamoError(err);
    }
  }

  async retrieveListing(gameName: string, query: QueryListing) {
    const param: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: query.index,
      ProjectionExpression: this.attributeExp,
      ExpressionAttributeNames: this.attributeName,
      KeyConditionExpression: "gameName = :gameName",
      FilterExpression: "listingStatus = :listingStatus",
      ExpressionAttributeValues: {
        ":gameName": gameName,
        ":listingStatus": "ACTIVE"
      },
      Limit: query.limit,
      ScanIndexForward: query.order
    };

    if (query.cursor) {
      param.ExclusiveStartKey = query.cursor;
    }

    try {
      const result = await this.docClient.send(new QueryCommand(param));

      return {
        items: result.Items ?? [],
        nextCursor: result.LastEvaluatedKey ?? null
      };
    } catch (err) {
      handleDynamoError(err);
    }
  }

  async retrieveSellerListing(sellerId: string, query: QueryListing) {
    const param: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: "SellerListingIndex",
      ProjectionExpression: this.attributeExp,
      ExpressionAttributeNames: this.attributeName,
      KeyConditionExpression: "sellerId = :sellerId",
      FilterExpression: "listingStatus <> :listingStatus",
      ExpressionAttributeValues: {
        ":sellerId": sellerId,
        ":listingStatus": "DELETED"
      },
      Limit: query.limit,
      ScanIndexForward: query.order
    };

    if (query.cursor) {
      param.ExclusiveStartKey = query.cursor;
    }

    try {
      const result = await this.docClient.send(new QueryCommand(param));

      return {
        items: result.Items ?? [],
        nextCursor: result.LastEvaluatedKey ?? null
      };
    } catch (err) {
      handleDynamoError(err);
    }
  }

  async updateListing(sellerId: string, listingId: string, listing: UpdateListingDto) {
    // check if sellerId is owner of the record
    const record = (await this.validateIsSellerListing(sellerId, listingId)) as ListingEntity[];

    if (record.length !== 0) {
      try {
        await this.docClient.send(
          new UpdateCommand({
            TableName: this.tableName,
            Key: {
              listingId: listingId
            },
            ...listing,
            ConditionExpression: "attribute_exists(listingId)"
          })
        );

        // retrieve updated result
        const gameName = record[0].gameName;
        const result = await this.docClient.send(
          new GetCommand({
            TableName: this.tableName,
            Key: {
              gameName: gameName,
              listingId: listingId
            },
            ProjectionExpression: this.attributeExp,
            ExpressionAttributeNames: this.attributeName
          })
        );

        return result.Item;
      } catch (err) {
        handleDynamoError(err);
      }
    } else {
      throw new ForbiddenException("Record doesn't exist or unauthorized");
    }
  }

  async deleteListing(sellerId: string, listingId: string) {
    // check if sellerId is owner of the record
    const record = (await this.validateIsSellerListing(sellerId, listingId)) as ListingEntity[];

    if (record.length !== 0) {
      try {
        await this.docClient.send(
          new UpdateCommand({
            TableName: this.tableName,
            Key: {
              listingId: listingId
            },
            UpdateExpression: "SET listingStatus = :listingStatus",
            ExpressionAttributeValues: {
              ":listingStatus": "DELETED"
            },
            ConditionExpression: "attribute_exists(listingId)"
          })
        );

        return { message: "Deleted successfully" };
      } catch (err) {
        handleDynamoError(err);
      }
    } else {
      throw new ForbiddenException("Record doesn't exist or unauthorized");
    }
  }
}
