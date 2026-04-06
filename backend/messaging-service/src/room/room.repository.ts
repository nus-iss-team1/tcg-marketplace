import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLoggerService } from "../logger/logger.service";
import { DynamoDbService } from "../dynamodb/dynamodb.service";
import { handleDynamoError } from "../dynamodb/dynamodb.util";
import { Room } from "../dynamodb/messaging.schema";
import { RoomProjections } from "./types/room.view";

@Injectable()
export class RoomRepository {
  private readonly tableName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
    private readonly dynamoDbService: DynamoDbService
  ) {
    this.tableName = this.configService.getOrThrow<string>("MESSAGING_PLATFORM_TABLE");
  }

  async queryRooms(userId: string) {
    try {
      const result = await this.dynamoDbService.query({
        TableName: this.tableName,
        IndexName: "UserConversationIndex",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: "archived = :archived AND deleted = :deleted",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":archived": false,
          ":deleted": false
        },
        ...RoomProjections.overview,
        ScanIndexForward: false
      });

      return (result.Items as Room[]) ?? [];
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async getRoom(userId: string, conversationId: string) {
    try {
      const result = await this.dynamoDbService.get({
        TableName: this.tableName,
        Key: {
          conversationId: conversationId,
          meta: `USER#${userId}`
        },
        ...RoomProjections.overview
      });

      return result.Item as Room;
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async archiveRoom(userId: string, conversationId: string) {
    try {
      await this.dynamoDbService.update({
        TableName: this.tableName,
        Key: {
          conversationId: conversationId,
          meta: `USER#${userId}`
        },
        UpdateExpression: "SET archived = :archived",
        ExpressionAttributeValues: {
          ":archived": true
        }
      });

      // retrieve all rooms
      return await this.queryRooms(userId);
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async deleteRoom(userId: string, conversationId: string) {
    try {
      await this.dynamoDbService.update({
        TableName: this.tableName,
        Key: {
          conversationId: conversationId,
          meta: `USER#${userId}`
        },
        UpdateExpression: "SET deleted = :deleted",
        ExpressionAttributeValues: {
          ":deleted": true
        }
      });

      // retrieve all rooms
      return await this.queryRooms(userId);
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async updateLastSeen(userId: string, conversationId: string, messageId: string) {
    try {
      await this.dynamoDbService.update({
        TableName: this.tableName,
        Key: {
          conversationId: conversationId,
          meta: `USER#${userId}`
        },
        UpdateExpression: "SET lastSeenMessageId = :lastSeenMessageId",
        ExpressionAttributeValues: {
          ":lastSeenMessageId": messageId
        }
      });

      return await this.queryRooms(userId);
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  buildCreateRoom(
    conversationId: string,
    userId: string,
    recipientId: string,
    datetime: number,
    userName?: string,
    recipientName?: string,
    latestMessageId?: string,
    latestMessageSenderId?: string,
    latestMessage?: string,
    listingId?: string,
    listingGameName?: string
  ) {
    return {
      Put: {
        TableName: this.tableName,
        Item: {
          conversationId: conversationId,
          meta: `USER#${userId}`,
          userId: userId,
          recipientId: recipientId,
          ...(userName && { userName: userName }),
          ...(recipientName && { recipientName: recipientName }),
          latestMessage: latestMessage ?? "",
          latestMessageId: latestMessageId ?? null,
          ...(latestMessageSenderId && { latestMessageSenderId: latestMessageSenderId }),
          lastSeenMessageId: null,
          muted: false,
          pinned: false,
          archived: false,
          deleted: false,
          createdAt: datetime,
          updatedAt: datetime,
          ...(listingId && { listingId }),
          ...(listingGameName && { listingGameName })
        },
        ConditionExpression: "attribute_not_exists(conversationId)"
      }
    };
  }

  buildUpdateListingContext(
    conversationId: string,
    userId: string,
    listingId: string,
    listingGameName: string
  ) {
    return {
      Update: {
        TableName: this.tableName,
        Key: {
          conversationId: conversationId,
          meta: `USER#${userId}`
        },
        UpdateExpression:
          "SET listingId = :listingId, listingGameName = :listingGameName",
        ExpressionAttributeValues: {
          ":listingId": listingId,
          ":listingGameName": listingGameName
        }
      }
    };
  }

  buildUpdateLatestMessage(
    conversationId: string,
    userId: string,
    messageId: string,
    senderId: string,
    content: string,
    datetime: number,
    listingId?: string,
    listingGameName?: string
  ) {
    const hasListing = listingId && listingGameName;
    return {
      Update: {
        TableName: this.tableName,
        Key: {
          conversationId: conversationId,
          meta: `USER#${userId}`
        },
        UpdateExpression: hasListing
          ? "SET latestMessage = :latestMessage, latestMessageId = :latestMessageId, latestMessageSenderId = :senderId, updatedAt = :updatedAt, listingId = :listingId, listingGameName = :listingGameName"
          : "SET latestMessage = :latestMessage, latestMessageId = :latestMessageId, latestMessageSenderId = :senderId, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":latestMessage": content,
          ":latestMessageId": messageId,
          ":senderId": senderId,
          ":updatedAt": datetime,
          ...(hasListing && { ":listingId": listingId, ":listingGameName": listingGameName })
        }
      }
    };
  }
}
