import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CognitoJwtPayload } from "./types/cognito-jwt-payload";

export const CurrentUser = createParamDecorator(
  (data: keyof CognitoJwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Express.Request>();
    const user = request.user;

    return data ? user?.[data] : user;
  }
);
