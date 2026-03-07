import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Inject, Injectable } from "@nestjs/common";
import { DYNAMODB_CLIENT } from "../dynamodb/dynamodb.constants";

@Injectable()
export class ReferenceRepository {
  private readonly tableName = "GameCardLookup";

  constructor(
    @Inject(DYNAMODB_CLIENT)
    private readonly docClient: DynamoDBDocumentClient
  ) {}

  async retrieveGameName() {
    const param: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "begins_with(pk, :pk) AND sk = :sk",
      ExpressionAttributeValues: {
        ":pk": "game#",
        ":sk": "META"
      },
      ScanIndexForward: true
    };

    const result = await this.docClient.send(new QueryCommand(param));

    return result.Items ?? [];
  }

  async retrieveCardDetail(gameName: string, cardName?: string) {
    let expression = "pk = :pk";
    const value: Record<string, any> = {
      ":pk": `game#${gameName}`
    };

    if (cardName) {
      expression = `${expression} AND begins_with(sk, :sk)`;
      value[":sk"] = `card#${cardName}`;
    }

    const param: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: expression,
      ExpressionAttributeValues: value,
      ScanIndexForward: true
    };

    const result = await this.docClient.send(new QueryCommand(param));

    return result.Items ?? [];
  }
}
