import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

let userPool: CognitoUserPool | null = null;

function getUserPool(): CognitoUserPool {
  if (!userPool) {
    userPool = new CognitoUserPool({
      UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });
  }
  return userPool;
}

export interface SignUpAttributes {
  email: string;
  givenName: string;
  familyName: string;
  address?: string;
}

export function signUp(
  username: string,
  password: string,
  attrs: SignUpAttributes
): Promise<CognitoUser> {
  const attributes: CognitoUserAttribute[] = [
    new CognitoUserAttribute({ Name: "email", Value: attrs.email }),
    new CognitoUserAttribute({ Name: "given_name", Value: attrs.givenName }),
    new CognitoUserAttribute({ Name: "family_name", Value: attrs.familyName }),
  ];
  if (attrs.address) {
    attributes.push(new CognitoUserAttribute({ Name: "address", Value: attrs.address }));
  }

  return new Promise((resolve, reject) => {
    getUserPool().signUp(username, password, attributes, [], (err, result) => {
      if (err || !result) {
        reject(err);
        return;
      }
      resolve(result.user);
    });
  });
}

export function confirmSignUp(
  username: string,
  code: string
): Promise<void> {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: getUserPool(),
  });

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function resendConfirmationCode(username: string): Promise<void> {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: getUserPool(),
  });

  return new Promise((resolve, reject) => {
    cognitoUser.resendConfirmationCode((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function signIn(
  username: string,
  password: string
): Promise<CognitoUserSession> {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: getUserPool(),
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
  const currentUser = getUserPool().getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }
}

export function getCurrentSession(): Promise<CognitoUserSession | null> {
  const currentUser = getUserPool().getCurrentUser();
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

export function refreshSession(): Promise<CognitoUserSession> {
  const currentUser = getUserPool().getCurrentUser();
  if (!currentUser) return Promise.reject(new Error("No user"));

  return new Promise((resolve, reject) => {
    currentUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err);
          return;
        }
        const refreshToken = session.getRefreshToken();
        currentUser.refreshSession(refreshToken, (refreshErr, newSession) => {
          if (refreshErr) {
            reject(refreshErr);
            return;
          }
          resolve(newSession);
        });
      }
    );
  });
}

export function getCurrentUser() {
  return getUserPool().getCurrentUser();
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.getIdToken().getJwtToken() ?? null;
}

export function getUserAttributes(): Promise<Record<string, string>> {
  const currentUser = getUserPool().getCurrentUser();
  if (!currentUser) return Promise.reject(new Error("No user"));

  return new Promise((resolve, reject) => {
    currentUser.getSession((err: Error | null) => {
      if (err) {
        reject(err);
        return;
      }
      currentUser.getUserAttributes((attrErr, attributes) => {
        if (attrErr || !attributes) {
          reject(attrErr);
          return;
        }
        const attrs: Record<string, string> = {};
        attributes.forEach((attr) => {
          attrs[attr.getName()] = attr.getValue();
        });
        resolve(attrs);
      });
    });
  });
}

export function updateUserAttributes(
  attributes: Record<string, string>
): Promise<void> {
  const currentUser = getUserPool().getCurrentUser();
  if (!currentUser) return Promise.reject(new Error("No user"));

  const attributeList = Object.entries(attributes).map(
    ([key, value]) => new CognitoUserAttribute({ Name: key, Value: value })
  );

  return new Promise((resolve, reject) => {
    currentUser.getSession((err: Error | null) => {
      if (err) {
        reject(err);
        return;
      }
      currentUser.updateAttributes(attributeList, (updateErr) => {
        if (updateErr) {
          reject(updateErr);
          return;
        }
        resolve();
      });
    });
  });
}

export function forgotPassword(username: string): Promise<void> {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: getUserPool(),
  });

  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

export function confirmForgotPassword(
  username: string,
  code: string,
  newPassword: string
): Promise<void> {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: getUserPool(),
  });

  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

export function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const currentUser = getUserPool().getCurrentUser();
  if (!currentUser) return Promise.reject(new Error("No user"));

  return new Promise((resolve, reject) => {
    currentUser.getSession((err: Error | null) => {
      if (err) {
        reject(err);
        return;
      }
      currentUser.changePassword(oldPassword, newPassword, (changeErr) => {
        if (changeErr) {
          reject(changeErr);
          return;
        }
        resolve();
      });
    });
  });
}
