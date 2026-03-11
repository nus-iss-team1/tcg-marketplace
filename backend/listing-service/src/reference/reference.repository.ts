import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { DYNAMODB_CLIENT } from "../dynamodb/dynamodb.constants";
import { buildProjection } from "../dynamodb/dynamodb.util";
import { CardLookup, GameLookup } from "./types/reference.schema";
import { handleDynamoError } from "../common/utils/common.utils";
import { LoggingService } from "../logger/logging.service";

@Injectable()
export class ReferenceRepository {
  private logger: LoggerService;
  private readonly tableName = "GameCardLookup";
  private gameProjection: ReturnType<typeof buildProjection>;
  private cardProjection: ReturnType<typeof buildProjection>;

  constructor(
    loggingService: LoggingService,
    @Inject(DYNAMODB_CLIENT)
    private readonly docClient: DynamoDBDocumentClient
  ) {
    this.logger = loggingService.getLogger();
    this.gameProjection = buildProjection(GameLookup);
    this.cardProjection = buildProjection(CardLookup);
  }

  async retrieveGameName() {
    const param: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "gameId = :gameId",
      ExpressionAttributeValues: {
        ":gameId": "gamedata"
      },
      ...this.gameProjection,
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
      ...this.cardProjection,
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
