import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { instanceToPlain } from "class-transformer";
import { DYNAMODB_CLIENT } from "../dynamodb/dynamodb.constants";
import { Listing } from "./types/marketplace.schema";
import { QueryListing } from "./types/marketplace.type";
import { handleDynamoError } from "../common/utils/common.utils";
import { LoggingService } from "../logger/logging.service";
import { ListingProjections } from "./types/marketplace.view";

@Injectable()
export class MarketplaceRepository {
  private logger: LoggerService;
  private readonly tableName = "TCGMarketplace";

  constructor(
    loggingService: LoggingService,
    @Inject(DYNAMODB_CLIENT)
    private readonly docClient: DynamoDBDocumentClient
  ) {
    this.logger = loggingService.getLogger();
  }

  async createListing(listing: Listing) {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: instanceToPlain(listing)
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
          ...ListingProjections.specificListing
        })
      );
      return result.Item as Listing;
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async retrieveListing(gameName: string, query: QueryListing) {
    let filterExpression = "listingStatus <> :listingStatus";
    const expressionAttributeValues = {
      ":gameName": gameName,
      ":listingStatus": "DELETED"
    };

    if (query.filter && query.filterValue) {
      filterExpression += ` AND contains(${query.filter}, :${query.filter})`;
      expressionAttributeValues[`:${query.filter}`] = query.filterValue;
    }

    const param: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: query.index,
      KeyConditionExpression: "gameName = :gameName",
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ...ListingProjections.overview,
      Limit: query.limit,
      ScanIndexForward: query.order
    };

    if (query.cursor) {
      param.ExclusiveStartKey = query.cursor;
    }

    try {
      const result = await this.docClient.send(new QueryCommand(param));

      return {
        items: (result.Items as Listing[]) ?? [],
        nextCursor: result.LastEvaluatedKey ?? null
      };
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async retrieveSpecificListing(gameName: string, listingId: string) {
    try {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: "gameName = :gameName AND listingId = :listingId",
          FilterExpression: "listingStatus <> :listingStatus",
          ExpressionAttributeValues: {
            ":gameName": gameName,
            ":listingId": listingId,
            ":listingStatus": "DELETED"
          },
          ...ListingProjections.specificListing
        })
      );

      const records = result.Items as Listing[];
      return records[0] ?? {};
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async retrieveSpecificSellerListing(sellerId: string, listingId: string) {
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

      return (result.Items as Listing[]) ?? [];
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async retrieveSellerListing(sellerId: string, query: QueryListing) {
    let filterExpression = "listingStatus <> :listingStatus";
    const expressionAttributeValues = {
      ":sellerId": sellerId,
      ":listingStatus": "DELETED"
    };

    if (query.filter && query.filterValue) {
      filterExpression += ` AND contains(${query.filter}, :${query.filter})`;
      expressionAttributeValues[`:${query.filter}`] = query.filterValue;
    }

    const param: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: "SellerListingIndex",
      KeyConditionExpression: "sellerId = :sellerId",
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ...ListingProjections.overview,
      Limit: query.limit,
      ScanIndexForward: query.order
    };

    if (query.cursor) {
      param.ExclusiveStartKey = query.cursor;
    }

    try {
      const result = await this.docClient.send(new QueryCommand(param));

      return {
        items: (result.Items as Listing[]) ?? [],
        nextCursor: result.LastEvaluatedKey ?? null
      };
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async updateListing(listing: Listing) {
    const { gameName, listingId, sellerId: _sellerId, ...updateListing } = listing;

    // remove undefined value
    const filteredListing = Object.fromEntries(
      Object.entries(instanceToPlain(updateListing)).filter(([, v]) => v !== undefined)
    );

    const keys = Object.keys(filteredListing);
    const updateStatement = `SET ${keys.map((k) => `#${k} = :${k}`).join(", ")}`;
    const attributeNames = Object.fromEntries(keys.map((k) => [`#${k}`, k]));
    const attributeValues = Object.fromEntries(keys.map((k) => [`:${k}`, filteredListing[k]]));

    try {
      await this.docClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: {
            gameName: gameName,
            listingId: listingId
          },
          UpdateExpression: updateStatement,
          ExpressionAttributeNames: attributeNames,
          ExpressionAttributeValues: attributeValues,
          ConditionExpression: "attribute_exists(listingId)"
        })
      );

      // retrieve updated result
      const result = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            gameName: gameName,
            listingId: listingId
          },
          ...ListingProjections.specificListing
        })
      );

      return result.Item as Listing;
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async deleteListing(listing: Listing) {
    try {
      await this.docClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: {
            gameName: listing.gameName,
            listingId: listing.listingId
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
      this.logger.error(err);
      handleDynamoError(err);
    }
  }
}
