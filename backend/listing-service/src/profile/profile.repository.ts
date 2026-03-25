import { Injectable } from "@nestjs/common";
import { instanceToPlain } from "class-transformer";
import { UserProfile } from "./types/profile.schema";
import { handleDynamoError } from "../dynamodb/dynamodb.util";
import { AppLoggerService } from "../logger/logger.service";
import { ProfileProjections } from "./types/profile.view";
import { DynamoDbService } from "../dynamodb/dynamodb.service";

@Injectable()
export class ProfileRepository {
  private readonly tableName = "UserProfile";

  constructor(
    private readonly logger: AppLoggerService,
    private readonly dynamoDbService: DynamoDbService
  ) {}

  async createProfile(profile: UserProfile) {
    try {
      await this.dynamoDbService.put({
        TableName: this.tableName,
        Item: instanceToPlain(profile),
        ConditionExpression: "attribute_not_exists(userId)"
      });

      const result = await this.dynamoDbService.get({
        TableName: this.tableName,
        Key: { userId: profile.userId },
        ...ProfileProjections.full
      });
      return result.Item as UserProfile;
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async getProfile(userId: string) {
    try {
      const result = await this.dynamoDbService.get({
        TableName: this.tableName,
        Key: { userId },
        ...ProfileProjections.full
      });
      return (result.Item as UserProfile) ?? null;
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { userId: _userId, joinedAt: _joinedAt, ...updateFields } = updates;

    const filtered = Object.fromEntries(
      Object.entries(instanceToPlain(updateFields)).filter(([, v]) => v !== undefined)
    );

    const keys = Object.keys(filtered);
    if (keys.length === 0) {
      return this.getProfile(userId);
    }

    const updateStatement = `SET ${keys.map((k) => `#${k} = :${k}`).join(", ")}`;
    const attributeNames = Object.fromEntries(keys.map((k) => [`#${k}`, k]));
    const attributeValues = Object.fromEntries(keys.map((k) => [`:${k}`, filtered[k]]));

    try {
      await this.dynamoDbService.update({
        TableName: this.tableName,
        Key: { userId },
        UpdateExpression: updateStatement,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
        ConditionExpression: "attribute_exists(userId)"
      });

      const result = await this.dynamoDbService.get({
        TableName: this.tableName,
        Key: { userId },
        ...ProfileProjections.full
      });
      return result.Item as UserProfile;
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }
}
