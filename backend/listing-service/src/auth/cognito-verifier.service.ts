import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { ConfigService } from "@nestjs/config";
import { CognitoJwtPayload } from "./types/cognito-jwt-payload";

@Injectable()
export class CognitoVerifierService {
  private readonly verifier: ReturnType<typeof CognitoJwtVerifier.create>;

  constructor(private readonly configService: ConfigService) {
    const userPoolId = this.configService.getOrThrow<string>("COGNITO_USER_POOL_ID");
    const clientId = this.configService.getOrThrow<string>("COGNITO_APP_CLIENT_ID");

    this.verifier = CognitoJwtVerifier.create({
      userPoolId: userPoolId,
      clientId: clientId,
      tokenUse: "access"
    });
  }

  async verifyToken(token: string): Promise<CognitoJwtPayload> {
    try {
      const payload = await this.verifier.verify(token);
      return payload;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
