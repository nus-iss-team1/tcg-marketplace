import { Injectable, LoggerService, UnauthorizedException } from "@nestjs/common";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { ConfigService } from "@nestjs/config";
import { CognitoJwtPayload } from "./types/cognito-jwt-payload";
import { LoggingService } from "../logger/logging.service";

@Injectable()
export class CognitoVerifierService {
  private logger: LoggerService;
  private readonly verifier: ReturnType<typeof CognitoJwtVerifier.create>;

  constructor(
    loggingService: LoggingService,
    private readonly configService: ConfigService
  ) {
    this.logger = loggingService.getLogger();

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
