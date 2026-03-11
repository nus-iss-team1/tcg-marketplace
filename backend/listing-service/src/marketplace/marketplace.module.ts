import { Module } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";
import { MarketplaceController } from "./marketplace.controller";
import { MarketplaceRepository } from "./marketplace.repository";
import { S3Module } from "../s3/s3.module";

@Module({
  imports: [S3Module],
  controllers: [MarketplaceController],
  providers: [MarketplaceService, MarketplaceRepository]
})
export class MarketplaceModule {}
