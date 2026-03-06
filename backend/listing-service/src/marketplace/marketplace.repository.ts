import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { Inject, Injectable } from "@nestjs/common";
import { DYNAMODB_CLIENT } from "../dynamodb/dynamodb.constants";
import { CreateListingDto } from "./dto/create-listing.dto";
import { QueryListingCursor } from "./types/marketplace.type";
import { UpdateListingDto } from "./dto/update-listing.dto";

@Injectable()
export class MarketplaceRepository {
  private readonly tableName = "TCGMarketplace";

  constructor(
    @Inject(DYNAMODB_CLIENT)
    private readonly docClient: DynamoDBDocumentClient
  ) {}

  async createListing(listing: CreateListingDto) {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: listing
      })
    );

    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { listingId: listing.listingId }
      })
    );
    return result.Item;
  }

  async retrieveListing(gameName: string, limit: number, cursor?: QueryListingCursor) {
    const param: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: "GameListingIndex",
      KeyConditionExpression: "gameName = :gameName",
      FilterExpression: "listingStatus = :listingStatus",
      ExpressionAttributeValues: {
        ":gameName": gameName,
        ":listingStatus": "ACTIVE"
      },
      Limit: limit,
      ScanIndexForward: false
    };

    if (cursor) {
      param.ExclusiveStartKey = cursor;
    }

    const result = await this.docClient.send(new QueryCommand(param));

    return {
      items: result.Items ?? [],
      nextCursor: result.LastEvaluatedKey ?? null
    };
  }

  async retrieveSellerListing(sellerId: string, limit: number, cursor?: QueryListingCursor) {
    const param: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: "SellerDashboardIndex",
      KeyConditionExpression: "sellerId = :sellerId",
      FilterExpression: "listingStatus <> :listingStatus",
      ExpressionAttributeValues: {
        ":sellerId": sellerId,
        ":listingStatus": "DELETED"
      },
      Limit: limit,
      ScanIndexForward: false
    };

    if (cursor) {
      param.ExclusiveStartKey = cursor;
    }

    const result = await this.docClient.send(new QueryCommand(param));

    return {
      items: result.Items ?? [],
      nextCursor: result.LastEvaluatedKey ?? null
    };
  }

  async updateListing(listingId: string, listing: UpdateListingDto) {
    return await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          listingId: listingId
        },
        ...listing
      })
    );
  }

  async deleteListing(listingId: string) {
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
  }
}
