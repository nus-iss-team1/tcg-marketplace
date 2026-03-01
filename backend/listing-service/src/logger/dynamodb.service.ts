import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as winston from "winston";
import "winston-daily-rotate-file";

@Injectable()
export class DynamoDbService {
  private readonly client: DynamoDBDocumentClient;
  private readonly logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.getOrThrow<string>("AWS_REGION");
    const logDir = this.configService.getOrThrow<string>("LOG_DIR");
    const logLevel = this.configService.getOrThrow<string>("LOG_LEVEL");

    const rawClient = new DynamoDBClient({ region: region });
    this.client = DynamoDBDocumentClient.from(rawClient);

    const logFormat = winston.format.printf((info) => {
      const timestamp = typeof info.timestamp === "string" ? info.timestamp : "";
      const message =
        typeof info.message === "string" ? info.message : JSON.stringify(info.message);

      return `${timestamp} [DynamoDB] ${message}`;
    });

    this.logger = winston.createLogger({
      level: logLevel,
      transports: [
        new winston.transports.DailyRotateFile({
          dirname: `${logDir}/dynamodb`,
          filename: "dynamodb-%DATE%.log",
          auditFile: `${logDir}/dynamodb-audit.json`,
          datePattern: "YYYYMMDD",
          maxSize: "10m",
          maxFiles: "14d",
          format: winston.format.combine(
            winston.format.timestamp({
              format: "YYYY-MM-DD HH:mm:ss"
            }),
            logFormat
          )
        })
      ]
    });
  }

  async put(params: PutCommand["input"]): Promise<void> {
    this.logger.info(`PUT ${params.TableName}`);
    await this.client.send(new PutCommand(params));
  }

  async get(params: GetCommand["input"]) {
    this.logger.info(`GET ${params.TableName}`);
    return this.client.send(new GetCommand(params));
  }

  async update(params: UpdateCommand["input"]) {
    this.logger.info(`UPDATE ${params.TableName}`);
    return this.client.send(new UpdateCommand(params));
  }

  async delete(params: DeleteCommand["input"]) {
    this.logger.info(`DELETE ${params.TableName}`);
    return this.client.send(new DeleteCommand(params));
  }
}
