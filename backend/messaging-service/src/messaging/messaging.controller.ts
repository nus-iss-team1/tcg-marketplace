import { Controller, UseGuards } from "@nestjs/common";
import { CognitoAuthGuard } from "../auth/cognito-auth.guard";

@UseGuards(CognitoAuthGuard)
@Controller()
export class MessagingController {}
