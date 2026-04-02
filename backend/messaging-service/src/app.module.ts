import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { LoggerModule } from "./logger/logger.module";
import { DynamoDbModule } from "./dynamodb/dynamodb.module";
import { RedisService } from "./redis/redis.service";
import { RoomModule } from "./room/room.module";
import { MessageModule } from "./message/message.module";
import { MessagingGateway } from "./web-socket/messaging.gateway";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validationSchema: Joi.object({
        TZ: Joi.string().required(),
        LOG_DIR: Joi.string().required(),
        LOG_LEVEL: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        COGNITO_USER_POOL_ID: Joi.string().required(),
        COGNITO_APP_CLIENT_ID: Joi.string().required(),
        MESSAGING_PLATFORM_TABLE: Joi.string().default("MessagingPlatform"),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379)
      }),
      validationOptions: {
        abortEarly: true
      }
    }),
    AuthModule,
    LoggerModule,
    DynamoDbModule,
    RoomModule,
    MessageModule
  ],
  controllers: [AppController],
  providers: [AppService, RedisService, MessagingGateway]
})
export class AppModule {}
