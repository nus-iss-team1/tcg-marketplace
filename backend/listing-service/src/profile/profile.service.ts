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

  async createProfile(userId: string, dto: CreateProfileDto, sub?: string) {
    this.logger.log(`Creating profile for user: ${userId}`, "ProfileService");

    const profile: UserProfile = {
      userId,
      ...(sub && { sub }),
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
    return await this.profileRepo.getProfile(userId);
  }

  async getProfileBySub(sub: string) {
    this.logger.log(`Fetching profile by sub: ${sub}`, "ProfileService");
    return await this.profileRepo.getProfileBySub(sub);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    this.logger.log(`Updating profile for user: ${userId}`, "ProfileService");
    return await this.profileRepo.updateProfile(userId, dto);
  }
}
