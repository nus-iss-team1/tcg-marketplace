import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { LoggerModule } from "./logger/logger.module";
import { MarketplaceModule } from "./marketplace/marketplace.module";
import { DynamoDbModule } from "./dynamodb/dynamodb.module";
import { ReferenceModule } from "./reference/reference.module";
import { S3Module } from "./s3/s3.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validationSchema: Joi.object({
        TZ: Joi.string().required(),
        LOG_DIR: Joi.string().optional(),
        LOG_LEVEL: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().optional(),
        AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
        AWS_S3_BUCKET: Joi.string().required(),
        CDN_URL: Joi.string().required(),
        COGNITO_USER_POOL_ID: Joi.string().required(),
        COGNITO_APP_CLIENT_ID: Joi.string().required()
      }),
      validationOptions: {
        abortEarly: true
      }
    }),
    AuthModule,
    LoggerModule,
    DynamoDbModule,
    MarketplaceModule,
    ReferenceModule,
    S3Module
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
