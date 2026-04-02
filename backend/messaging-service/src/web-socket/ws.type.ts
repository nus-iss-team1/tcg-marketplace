import { Socket } from "socket.io";
import { CognitoJwtPayload } from "../auth/types/cognito-jwt-payload";

interface AuthPayload {
  token?: string;
}

export interface SocketWithUser extends Socket {
  data: {
    user: CognitoJwtPayload;
  };
  handshake: Socket["handshake"] & {
    auth: AuthPayload;
  };
}
