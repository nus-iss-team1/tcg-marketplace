import { Module } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";
import { MarketplaceController } from "./marketplace.controller";
import { MarketplaceRepository } from "./marketplace.repository";

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService, MarketplaceRepository]
})
export class MarketplaceModule {}
