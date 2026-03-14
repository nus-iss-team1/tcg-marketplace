import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { DYNAMODB_CLIENT } from "../dynamodb/dynamodb.constants";
import { handleDynamoError } from "../common/utils/common.utils";
import { LoggingService } from "../logger/logging.service";
import { GameCardProjections } from "./types/reference.view";

@Injectable()
export class ReferenceRepository {
  private logger: LoggerService;
  private readonly tableName = "GameCardLookup";

  constructor(
    loggingService: LoggingService,
    @Inject(DYNAMODB_CLIENT)
    private readonly docClient: DynamoDBDocumentClient
  ) {
    this.logger = loggingService.getLogger();
  }

  async retrieveGameName() {
    const param: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "gameId = :gameId",
      ExpressionAttributeValues: {
        ":gameId": "gamedata"
      },
      ...GameCardProjections.gameLookup,
      ScanIndexForward: true
    };

    try {
      const result = await this.docClient.send(new QueryCommand(param));

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

    const param: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: expression,
      FilterExpression: "gameName = :gameName",
      ExpressionAttributeValues: value,
      ...GameCardProjections.cardLookup,
      ScanIndexForward: true
    };

    try {
      const result = await this.docClient.send(new QueryCommand(param));

      return result.Items ?? [];
    } catch (err) {
      this.logger.error(err);
      handleDynamoError(err);
    }
  }
}
