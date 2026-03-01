import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggingService } from "./logging.service";
import { DynamoDbService } from "./dynamodb.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LoggingService, DynamoDbService],
  exports: [LoggingService, DynamoDbService]
})
export class LoggingModule {}
