import { Injectable } from "@nestjs/common";
import { handleDynamoError } from "../common/utils/common.utils";
import { AppLoggerService } from "../logger/logger.service";
import { GameCardProjections } from "./types/reference.view";
import { DynamoDbService } from "../dynamodb/dynamodb.service";

@Injectable()
export class ReferenceRepository {
  private readonly tableName = "GameCardLookup";

  constructor(
    private readonly logger: AppLoggerService,
    private readonly dynamoDbService: DynamoDbService
  ) {}

  async retrieveGameName() {
    try {
      const result = await this.dynamoDbService.query({
        TableName: this.tableName,
        KeyConditionExpression: "gameId = :gameId",
        ExpressionAttributeValues: {
          ":gameId": "gamedata"
        },
        ...GameCardProjections.gameLookup,
        ScanIndexForward: true
      });

      return result.Items ?? [];
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }

  async retrieveCardDetail(gameName: string, cardName?: string) {
    let expression = "gameId = :gameId";
    const value: Record<string, any> = {
      ":gameId": "carddata",
      ":gameName": gameName
    };

    if (cardName) {
      expression = `${expression} AND begins_with(meta, :meta)`;
      value[":meta"] = `card#${cardName}`;
    }

    try {
      const result = await this.dynamoDbService.query({
        TableName: this.tableName,
        KeyConditionExpression: expression,
        FilterExpression: "gameName = :gameName",
        ExpressionAttributeValues: value,
        ...GameCardProjections.cardLookup,
        ScanIndexForward: true
      });

      return result.Items ?? [];
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }
}
