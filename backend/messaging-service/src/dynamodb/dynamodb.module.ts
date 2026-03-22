import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DynamoDbService } from "./dynamodb.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DynamoDbService],
  exports: [DynamoDbService]
})
export class DynamoDbModule {}
