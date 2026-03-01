export interface CognitoJwtPayload {
  "sub": string;
  "email"?: string;
  "cognito:groups"?: string[];
  "client_id"?: string;
  "iss": string;
  "exp": number;
  "iat": number;
  "token_use": "access" | "id";
}
