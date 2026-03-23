import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { ConfigService } from "@nestjs/config";
import { CognitoJwtPayload } from "./types/cognito-jwt-payload";
import { AppLoggerService } from "../logger/logger.service";

@Injectable()
export class CognitoVerifierService {
  private readonly verifier: ReturnType<typeof CognitoJwtVerifier.create>;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService
  ) {
    const userPoolId = this.configService.getOrThrow<string>("COGNITO_USER_POOL_ID");
    const clientId = this.configService.getOrThrow<string>("COGNITO_APP_CLIENT_ID");

    this.verifier = CognitoJwtVerifier.create({
      userPoolId: userPoolId,
      clientId: clientId,
      tokenUse: "id"
    });
  }

  async verifyToken(token: string): Promise<CognitoJwtPayload> {
    try {
      const payload: CognitoJwtPayload = await this.verifier.verify(token);
      this.logger.log(
        `JWT verified for sub=${payload.sub} email=${payload.email ?? "unknown"} token_use=${payload.token_use}`
      );
      return payload;
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
