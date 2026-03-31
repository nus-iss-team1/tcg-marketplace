import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { DateTime } from "luxon";
import { AppLoggerService } from "../logger/logger.service";
import { DynamoDbService } from "../dynamodb/dynamodb.service";
import { handleDynamoError, padVersion } from "../dynamodb/dynamodb.util";
import { Message } from "../dynamodb/messaging.schema";
import { MessageCursor } from "./types/message.type";
import { TransactItem } from "../dynamodb/dynamodb.type";
import { MessageProjections } from "./types/message.view";

@Injectable()
export class MessageRepository {
  private readonly tableName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
    private readonly dynamoDbService: DynamoDbService
  ) {
    this.tableName = this.configService.getOrThrow<string>("MESSAGING_PLATFORM_TABLE");
  }

  async queryMessages(conversationId: string, cursor?: MessageCursor) {
    const param: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "conversationId = :conversationId AND begins_with(meta, :meta)",
      ExpressionAttributeValues: {
        ":conversationId": conversationId,
        ":meta": `MESSAGE#`
      },
      ...MessageProjections.overview,
      Limit: 20,
      ScanIndexForward: false
    };

    if (cursor) {
      param.ExclusiveStartKey = cursor;
    }

    try {
      const result = await this.dynamoDbService.query(param);

      return {
        items: (result.Items as Message[]) ?? [],
        nextCursor: result.LastEvaluatedKey ?? null
      };
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async getMessage(conversationId: string, messageId: string) {
    try {
      const result = await this.dynamoDbService.get({
        TableName: this.tableName,
        Key: {
          conversationId: conversationId,
          meta: `MESSAGE#${messageId}`
        },
        ...MessageProjections.overview
      });

      return result.Item as Message;
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async createMessage(conversationId: string, messageId: string, transactItems: TransactItem[]) {
    try {
      await this.dynamoDbService.transactWrite({
        TransactItems: transactItems
      });

      // retrieve created message
      const result = await this.dynamoDbService.get({
        TableName: this.tableName,
        Key: {
          conversationId: conversationId,
          meta: `MESSAGE#${messageId}`
        },
        ...MessageProjections.overview
      });

      return result.Item as Message;
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async editMessage(conversationId: string, messageId: string, transactItems: TransactItem[]) {
    try {
      await this.dynamoDbService.transactWrite({
        TransactItems: transactItems
      });

      // retrieve updated message
      const result = await this.dynamoDbService.get({
        TableName: this.tableName,
        Key: {
          conversationId: conversationId,
          meta: `MESSAGE#${messageId}`
        },
        ...MessageProjections.overview
      });

      return result.Item as Message;
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async deleteMessage(conversationId: string, messageId: string) {
    try {
      await this.dynamoDbService.update({
        TableName: this.tableName,
        Key: {
          conversationId: conversationId,
          meta: `MESSAGE#${messageId}`
        },
        UpdateExpression: "SET deleted = :deleted, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":deleted": true,
          ":updatedAt": DateTime.now().toMillis()
        }
      });

      return {
        conversationId: conversationId,
        messageId: messageId,
        message: "Deleted successfully"
      };
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  buildCreateMessage(
    conversationId: string,
    messageId: string,
    senderId: string,
    content: string,
    messageType: string,
    version: number,
    replyTo: string | null,
    datetime: number
  ) {
    return {
      Put: {
        TableName: this.tableName,
        Item: {
          conversationId: conversationId,
          meta: `MESSAGE#${messageId}`,
          filterContent: `${messageType}#${datetime}`,
          filterMessageType: `${messageType}#${datetime}`,
          messageId: messageId,
          senderId: senderId,
          content: content,
          messageType: messageType,
          version: version,
          reaction: {},
          replyTo: replyTo,
          createdAt: datetime,
          updatedAt: datetime,
          deleted: false
        },
        ConditionExpression: "attribute_not_exists(meta)"
      }
    };
  }

  buildCreateVersion(
    conversationId: string,
    messageId: string,
    userId: string,
    version: number,
    content: string,
    datetime: number
  ) {
    const paddedVersion = padVersion(version);

    return {
      Put: {
        TableName: this.tableName,
        Item: {
          conversationId: conversationId,
          meta: `VERSION#${messageId}#${paddedVersion}`,
          messageId: messageId,
          version: version,
          content: content,
          editedBy: userId,
          updatedAt: datetime,
          deleted: false
        }
      }
    };
  }

  buildUpdateContent(
    conversationId: string,
    messageId: string,
    content: string,
    version: number,
    datetime: number
  ) {
    return {
      Update: {
        TableName: this.tableName,
        Key: {
          conversationId: conversationId,
          meta: `MESSAGE#${messageId}`
        },
        UpdateExpression: "SET content = :content, version = :version, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":content": content,
          ":version": version,
          ":updatedAt": datetime
        }
      }
    };
  }
}
