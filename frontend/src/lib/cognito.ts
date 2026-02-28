import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
};

const userPool = new CognitoUserPool(poolData);

export function signUp(
  username: string,
  password: string,
  email?: string
): Promise<CognitoUser> {
  const attributes: CognitoUserAttribute[] = [];
  if (email) {
    attributes.push(new CognitoUserAttribute({ Name: "email", Value: email }));
  }

  return new Promise((resolve, reject) => {
    userPool.signUp(username, password, attributes, [], (err, result) => {
      if (err || !result) {
        reject(err);
        return;
      }
      resolve(result.user);
    });
  });
}

export function signIn(
  username: string,
  password: string
): Promise<CognitoUserSession> {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: resolve,
      onFailure: reject,
    });
  });
}

export function signOut(): void {
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }
}

export function getCurrentSession(): Promise<CognitoUserSession | null> {
  const currentUser = userPool.getCurrentUser();
  if (!currentUser) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    currentUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(session);
      }
    );
  });
}

export function getCurrentUser() {
  return userPool.getCurrentUser();
}
