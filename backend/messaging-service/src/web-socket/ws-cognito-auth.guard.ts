import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { CognitoVerifierService } from "../auth/cognito-verifier.service";
import { SocketWithUser } from "./ws.type";

@Injectable()
export class WsCognitoAuthGuard implements CanActivate {
  constructor(private readonly verifier: CognitoVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<SocketWithUser>();

    const authHeader = client.handshake.headers?.authorization ?? client.handshake.auth?.token;

    if (!authHeader) {
      throw new UnauthorizedException("Missing token");
    }

    let token: string;

    if (authHeader.startsWith?.("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    const payload = await this.verifier.verifyToken(token);
    client.data.user = payload;

    return true;
  }
}
