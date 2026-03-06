import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DYNAMODB_CLIENT } from "./dynamodb.constants";

@Global()
@Module({
  providers: [
    {
      provide: DYNAMODB_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = new DynamoDBClient({
          region: configService.getOrThrow<string>("AWS_REGION")
        });

        return DynamoDBDocumentClient.from(client, {
          marshallOptions: {
            removeUndefinedValues: true
          }
        });
      }
    }
  ],
  exports: [DYNAMODB_CLIENT]
})
export class DynamoDbModule {}
