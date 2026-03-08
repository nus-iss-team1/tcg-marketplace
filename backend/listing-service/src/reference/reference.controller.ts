import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CognitoAuthGuard } from "../auth/cognito-auth.guard";
import { Public } from "../auth/public.decorator";
import { ReferenceService } from "./reference.service";
import { QueryCardDetail } from "./types/reference.type";

@UseGuards(CognitoAuthGuard)
@Controller("reference")
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Public()
  @Get("/game")
  async gameName() {
    return await this.referenceService.retrieveGameName();
  }

  @Public()
  @Get("/card")
  async cardDetail(@Query() query: QueryCardDetail) {
    return await this.referenceService.retrieveCardDetail(query.gameName, query.cardName);
  }
}
