import { Injectable, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import "winston-daily-rotate-file";

@Injectable()
export class LoggingService {
  private readonly logger: LoggerService;

  constructor(private readonly configService: ConfigService) {
    const logDir = this.configService.getOrThrow<string>("LOG_DIR");
    const logLevel = this.configService.getOrThrow<string>("LOG_LEVEL");

    const baseFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf((info) => {
        const timestamp = typeof info.timestamp === "string" ? info.timestamp : "";
        const message =
          typeof info.message === "string" ? info.message : JSON.stringify(info.message);
        const context = typeof info.context === "string" ? `[${info.context}]` : "";
        const level = typeof info.level === "string" ? `[${info.level}]` : "";

        return `${timestamp} ${level.toUpperCase()} ${context}: ${message}`;
      })
    );

    this.logger = WinstonModule.createLogger({
      level: logLevel,
      transports: [
        new winston.transports.Console({
          level: logLevel,
          format: winston.format.combine(baseFormat, winston.format.colorize({ all: true }))
        }),
        new winston.transports.DailyRotateFile({
          dirname: `${logDir}/app`,
          filename: "app-%DATE%.log",
          auditFile: `${logDir}/app-audit.json`,
          datePattern: "YYYYMMDD",
          maxSize: "10m",
          maxFiles: "14d",
          level: logLevel,
          format: winston.format.combine(
            winston.format((info) => (info.level === "error" ? false : info))(),
            baseFormat
          )
        }),
        new winston.transports.DailyRotateFile({
          dirname: `${logDir}/error`,
          filename: "error-%DATE%.log",
          auditFile: `${logDir}/error-audit.json`,
          datePattern: "YYYYMMDD",
          maxSize: "10m",
          maxFiles: "14d",
          level: "error",
          format: baseFormat
        })
      ]
    });
  }

  public getLogger(): LoggerService {
    return this.logger;
  }
}
