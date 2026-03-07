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
    getUserPool().signUp(username, password, attributes, [], (err, result) => {
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

export function getCurrentUser() {
  return getUserPool().getCurrentUser();
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
