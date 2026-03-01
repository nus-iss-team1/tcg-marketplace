import { CognitoJwtPayload } from "./cognito-jwt-payload";

declare global {
  namespace Express {
    interface Request {
      user?: CognitoJwtPayload;
    }
  }
}
