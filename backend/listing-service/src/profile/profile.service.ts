import { Injectable } from "@nestjs/common";
import { AppLoggerService } from "../logger/logger.service";
import { ProfileRepository } from "./profile.repository";
import { CreateProfileDto, UpdateProfileDto } from "./dto/profile.dto";
import { UserProfile } from "./types/profile.schema";

@Injectable()
export class ProfileService {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly profileRepo: ProfileRepository
  ) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    this.logger.log(`Creating profile for user: ${userId}`, "ProfileService");

    const profile: UserProfile = {
      userId,
      displayName: dto.displayName,
      address: dto.address,
      bio: dto.bio,
      preferredPayment: dto.preferredPayment,
      joinedAt: Date.now()
    };

    return await this.profileRepo.createProfile(profile);
  }

  async getProfile(userId: string) {
    this.logger.log(`Fetching profile for user: ${userId}`, "ProfileService");

    const profile = await this.profileRepo.getProfile(userId);
    if (!profile) {
      this.logger.log(`Profile not found for user: ${userId}, auto-creating`, "ProfileService");
      const defaultProfile: UserProfile = {
        userId,
        displayName: userId,
        joinedAt: Date.now()
      };
      return await this.profileRepo.createProfile(defaultProfile);
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    this.logger.log(`Updating profile for user: ${userId}`, "ProfileService");
    return await this.profileRepo.updateProfile(userId, dto);
  }
}
