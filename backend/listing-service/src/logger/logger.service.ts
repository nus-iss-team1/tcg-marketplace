import { Injectable, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as winston from "winston";
import "winston-daily-rotate-file";

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    const logDir = this.configService.getOrThrow<string>("LOG_DIR");
    const logLevel = this.configService.getOrThrow<string>("LOG_LEVEL");

    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf((info) => {
        const ctx = info.context ? `[${info.context}]` : "";
        return `${info.timestamp} [${info.level.toUpperCase()}] ${ctx}: ${info.message}`;
      }),
      winston.format.colorize({ all: true })
    );

    const jsonFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    this.logger = winston.createLogger({
      level: logLevel,
      levels: winston.config.npm.levels,
      transports: [
        new winston.transports.Console({
          level: logLevel,
          format: consoleFormat
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
            jsonFormat
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
          format: jsonFormat
        })
      ]
    });
  }

  private stringify(message: any) {
    return typeof message === "string" ? message : JSON.stringify(message);
  }

  log(message: any, context?: string) {
    this.logger.info(this.stringify(message), { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(this.stringify(message), { context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(this.stringify(message), { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(this.stringify(message), { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(this.stringify(message), { context, trace });
  }
}
