import { Module } from "@nestjs/common";
import { ReferenceService } from "./reference.service";
import { ReferenceController } from "./reference.controller";
import { ReferenceRepository } from "./reference.repository";

@Module({
  controllers: [ReferenceController],
  providers: [ReferenceService, ReferenceRepository]
})
export class ReferenceModule {}
