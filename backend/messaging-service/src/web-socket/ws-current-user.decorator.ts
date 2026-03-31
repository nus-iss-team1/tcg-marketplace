import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SocketWithUser } from "./ws.type";

export const WsCurrentUser = createParamDecorator(
  (data: keyof SocketWithUser["data"]["user"] | undefined, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<SocketWithUser>();
    const user = client.data.user;

    if (!user) {
      throw new Error("User not found on WebSocket client");
    }

    return data ? user[data] : user;
  }
);
