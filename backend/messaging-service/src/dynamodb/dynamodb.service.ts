import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DeleteCommandInput,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
  TransactWriteCommandOutput,
  UpdateCommand,
  UpdateCommandInput
} from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DateTime } from "luxon";
import { AppLoggerService } from "../logger/logger.service";
import { DynamoCommandInput, DynamoCommandOutput } from "./dynamodb.type";

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

  private extractCommandDetails(input: DynamoCommandInput) {
    const table = input.TableName ?? "UnknownTable";
    const details: string[] = [];

    if ("IndexName" in input) {
      details.push(`Index=${JSON.stringify(input.IndexName)}`);
    }
    if ("Item" in input) {
      details.push(`Item=${JSON.stringify(input.Item)}`);
    }
    if ("Key" in input) {
      details.push(`Key=${JSON.stringify(input.Key)}`);
    }
    if ("KeyConditionExpression" in input) {
      details.push(`KeyCondition=${JSON.stringify(input.KeyConditionExpression)}`);
    }
    if ("FilterExpression" in input) {
      details.push(`Filter=${JSON.stringify(input.FilterExpression)}`);
    }
    if ("UpdateExpression" in input) {
      details.push(`Update=${JSON.stringify(input.UpdateExpression)}`);
    }
    if ("ExpressionAttributeValues" in input) {
      details.push(`Values=${JSON.stringify(input.ExpressionAttributeValues)}`);
    }

    return `${table} ${details.join(" ")}`;
  }

  private summarizeResult(result: DynamoCommandOutput | undefined) {
    if (!result) {
      return "No result";
    }

    if ("Items" in result && result.Items) {
      return `Items count: ${result.Items.length}`;
    }

    if ("Attributes" in result && result.Attributes) {
      return "Updated";
    }

    if ("Item" in result && result.Item) {
      return "Found";
    }

    return "OK";
  }

  private summarizeTransactResult(
    result: TransactWriteCommandOutput | undefined,
    params: TransactWriteCommandInput
  ) {
    if (!result) {
      return "No result";
    }

    const count = params.TransactItems?.length ?? 0;

    return `Executed ${count} operation(s)`;
  }

  async put(params: PutCommandInput) {
    this.logger.log(`PUT ${this.extractCommandDetails(params) ?? ""}`, "DynamoRequest");

    const startTime = DateTime.now().toMillis();
    const result = await this.client.send(new PutCommand(params));
    const duration = DateTime.now().toMillis() - startTime;

    this.logger.log(`PUT → ${this.summarizeResult(result)} (${duration}ms)`, "DynamoResponse");

    return result;
  }

  async get(params: GetCommandInput) {
    this.logger.log(`GET ${this.extractCommandDetails(params) ?? ""}`, "DynamoRequest");

    const startTime = DateTime.now().toMillis();
    const result = await this.client.send(new GetCommand(params));
    const duration = DateTime.now().toMillis() - startTime;

    this.logger.log(`GET → ${this.summarizeResult(result)} (${duration}ms)`, "DynamoResponse");

    return result;
  }

  async query(params: QueryCommandInput) {
    this.logger.log(`QUERY ${this.extractCommandDetails(params) ?? ""}`, "DynamoRequest");

    const startTime = DateTime.now().toMillis();
    const result = await this.client.send(new QueryCommand(params));
    const duration = DateTime.now().toMillis() - startTime;

    this.logger.log(`QUERY → ${this.summarizeResult(result)} (${duration}ms)`, "DynamoResponse");

    return result;
  }

  async scan(params: ScanCommandInput) {
    this.logger.log(`SCAN ${this.extractCommandDetails(params) ?? ""}`, "DynamoRequest");

    const startTime = DateTime.now().toMillis();
    const result = await this.client.send(new ScanCommand(params));
    const duration = DateTime.now().toMillis() - startTime;

    this.logger.log(`SCAN → ${this.summarizeResult(result)} (${duration}ms)`, "DynamoResponse");

    return result;
  }

  async update(params: UpdateCommandInput) {
    this.logger.log(`UPDATE ${this.extractCommandDetails(params) ?? ""}`, "DynamoRequest");

    const startTime = DateTime.now().toMillis();
    const result = await this.client.send(new UpdateCommand(params));
    const duration = DateTime.now().toMillis() - startTime;

    this.logger.log(`UPDATE → ${this.summarizeResult(result)} (${duration}ms)`, "DynamoResponse");

    return result;
  }

  async delete(params: DeleteCommandInput) {
    this.logger.log(`DELETE ${this.extractCommandDetails(params) ?? ""}`, "DynamoRequest");

    const startTime = DateTime.now().toMillis();
    const result = await this.client.send(new DeleteCommand(params));
    const duration = DateTime.now().toMillis() - startTime;

    this.logger.log(`DELETE → ${this.summarizeResult(result)} (${duration}ms)`, "DynamoResponse");

    return result;
  }

  async transactWrite(params: TransactWriteCommandInput) {
    this.logger.log(`TRANSACT_WRITE ${JSON.stringify(params)}`, "DynamoRequest");

    const startTime = DateTime.now().toMillis();
    const result = await this.client.send(new TransactWriteCommand(params));
    const duration = DateTime.now().toMillis() - startTime;

    this.logger.log(
      `TRANSACT_WRITE → ${this.summarizeTransactResult(result, params)} (${duration}ms)`,
      "DynamoResponse"
    );

    return result;
  }
}
