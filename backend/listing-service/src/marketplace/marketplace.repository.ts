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
import { buildProjection } from "../dynamodb/dynamodb.util";
import { Listing, TCGMarketplaceSchema } from "./types/marketplace.schema";
import { QueryListing } from "./types/marketplace.type";
import { UpdateListingDto } from "./dto/marketplace.dto";
import { handleDynamoError } from "../common/utils/common.utils";

@Injectable()
export class MarketplaceRepository {
  private readonly tableName = "TCGMarketplace";
  private projection: ReturnType<typeof buildProjection>;

  constructor(
    @Inject(DYNAMODB_CLIENT)
    private readonly docClient: DynamoDBDocumentClient
  ) {
    this.projection = buildProjection(TCGMarketplaceSchema);
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

  async createListing(listing: Listing) {
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
          ...this.projection
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
      KeyConditionExpression: "gameName = :gameName",
      FilterExpression: "listingStatus = :listingStatus",
      ExpressionAttributeValues: {
        ":gameName": gameName,
        ":listingStatus": "ACTIVE"
      },
      ...this.projection,
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
      KeyConditionExpression: "sellerId = :sellerId",
      FilterExpression: "listingStatus <> :listingStatus",
      ExpressionAttributeValues: {
        ":sellerId": sellerId,
        ":listingStatus": "DELETED"
      },
      ...this.projection,
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
    const record = (await this.validateIsSellerListing(sellerId, listingId)) as Listing[];

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
            ...this.projection
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
    const record = (await this.validateIsSellerListing(sellerId, listingId)) as Listing[];

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
