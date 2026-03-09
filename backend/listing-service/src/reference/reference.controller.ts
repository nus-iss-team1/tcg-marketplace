import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CognitoAuthGuard } from "../auth/cognito-auth.guard";
import { Public } from "../auth/public.decorator";
import { ReferenceService } from "./reference.service";
import { QueryCardDto } from "./dto/reference.dto";

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
  async cardDetail(@Query() query: QueryCardDto) {
    return await this.referenceService.retrieveCardDetail(query.gameName, query.cardName);
  }
}
