import { Controller, Get, Post, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { CognitoAuthGuard } from "../auth/cognito-auth.guard";
import { Public } from "../auth/public.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { ProfileService } from "./profile.service";
import { CreateProfileDto, UpdateProfileDto } from "./dto/profile.dto";

@UseGuards(CognitoAuthGuard)
@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  async create(
    @CurrentUser("cognito:username") username: string,
    @Body() dto: CreateProfileDto
  ) {
    return await this.profileService.createProfile(username, dto);
  }

  @Public()
  @Get(":userId")
  async getProfile(@Param("userId") userId: string) {
    return await this.profileService.getProfile(userId);
  }

  @Patch()
  async update(
    @CurrentUser("cognito:username") username: string,
    @Body() dto: UpdateProfileDto
  ) {
    return await this.profileService.updateProfile(username, dto);
  }
}
