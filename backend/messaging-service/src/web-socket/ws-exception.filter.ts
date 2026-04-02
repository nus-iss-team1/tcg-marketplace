import { ArgumentsHost, Catch, WsExceptionFilter } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { SocketWithUser } from "./ws.type";

@Catch()
export class AllWsExceptionFilter implements WsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<SocketWithUser>();

    let message = "Internal server error";

    if (exception instanceof WsException) {
      message = exception.getError() as string;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    client.emit("error", {
      success: false,
      message: message
    });
  }
}
