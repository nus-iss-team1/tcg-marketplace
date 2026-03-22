import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DeleteCommandInput,
  DeleteCommandOutput,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
  PutCommand,
  PutCommandInput,
  PutCommandOutput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  UpdateCommand,
  UpdateCommandInput,
  UpdateCommandOutput
} from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DateTime } from "luxon";
import { AppLoggerService } from "../logger/logger.service";

@Injectable()
export class DynamoDbService {
  private readonly client: DynamoDBDocumentClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService
  ) {
    const region = this.configService.getOrThrow<string>("AWS_REGION");
    const rawClient = new DynamoDBClient({ region: region });

    this.client = DynamoDBDocumentClient.from(rawClient, {
      marshallOptions: {
        removeUndefinedValues: true
      }
    });
  }

  private extractCommandDetails(command: any) {
    const input = command.input;
    const table = input.TableName ?? "UnknownTable";
    const details: string[] = [];

    if (input.Item) {
      details.push(`Item=${JSON.stringify(input.Item)}`);
    }
    if (input.Key) {
      details.push(`Key=${JSON.stringify(input.Key)}`);
    }
    if (input.KeyConditionExpression) {
      details.push(`KeyCondition=${JSON.stringify(input.KeyConditionExpression)}`);
    }
    if (input.FilterExpression) {
      details.push(`Filter=${JSON.stringify(input.FilterExpression)}`);
    }
    if (input.UpdateExpression) {
      details.push(`Update=${JSON.stringify(input.UpdateExpression)}`);
    }
    if (input.ExpressionAttributeValues) {
      details.push(`Values=${JSON.stringify(input.ExpressionAttributeValues)}`);
    }
    // if (input.ExpressionAttributeNames) {
    //   details.push(`Names=${JSON.stringify(input.ExpressionAttributeNames)}`);
    // }
    if (input.IndexName) {
      details.push(`Index=${JSON.stringify(input.IndexName)}`);
    }

    return `${table} ${details.join(" ")}`;
  }

  private summarizeResult(result: any) {
    if (!result) {
      return "No result";
    }

    if (result.Items) {
      return `Items count: ${result.Items.length}`;
    }

    if (result.Attributes) {
      return "Updated";
    }

    if (result.Item) {
      return "Found";
    }

    return "OK";
  }

  private async sendCommand<T>(
    command: any,
    meta: {
      type: "PUT" | "GET" | "QUERY" | "SCAN" | "UPDATE" | "DELETE";
      table?: string;
      details?: string;
    }
  ) {
    const startTime = DateTime.now().toMillis();

    this.logger.log(
      `${meta.type} ${meta.table ?? "UnknownTable"} ${meta.details ?? ""}`,
      "DynamoRequest"
    );

    const result = await this.client.send(command);
    const duration = DateTime.now().toMillis() - startTime;

    this.logger.log(
      `${meta.type} → ${this.summarizeResult(result)} (${duration}ms)`,
      "DynamoResponse"
    );

    return result as T;
  }

  async put(params: PutCommandInput) {
    const command = new PutCommand(params);
    return this.sendCommand<PutCommandOutput>(command, {
      type: "PUT",
      table: params.TableName,
      details: this.extractCommandDetails(command)
    });
  }

  async get(params: GetCommandInput) {
    const command = new GetCommand(params);
    return this.sendCommand<GetCommandOutput>(command, {
      type: "GET",
      table: params.TableName,
      details: this.extractCommandDetails(command)
    });
  }

  async query(params: QueryCommandInput) {
    const command = new QueryCommand(params);
    return this.sendCommand<QueryCommandOutput>(command, {
      type: "QUERY",
      table: params.TableName,
      details: this.extractCommandDetails(command)
    });
  }

  async scan(params: ScanCommandInput) {
    const command = new ScanCommand(params);
    return this.sendCommand<ScanCommandOutput>(command, {
      type: "SCAN",
      table: params.TableName,
      details: this.extractCommandDetails(command)
    });
  }

  async update(params: UpdateCommandInput) {
    const command = new UpdateCommand(params);
    return this.sendCommand<UpdateCommandOutput>(command, {
      type: "UPDATE",
      table: params.TableName,
      details: this.extractCommandDetails(command)
    });
  }

  async delete(params: DeleteCommandInput) {
    const command = new DeleteCommand(params);
    return this.sendCommand<DeleteCommandOutput>(command, {
      type: "DELETE",
      table: params.TableName,
      details: this.extractCommandDetails(command)
    });
  }
}
