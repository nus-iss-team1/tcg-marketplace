"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import {
  signIn as cognitoSignIn,
  signUp as cognitoSignUp,
  signOut as cognitoSignOut,
  getCurrentSession,
  refreshSession,
  type SignUpAttributes,
} from "@/lib/cognito";
import { fetchSellerProfile, createSellerProfile } from "@/lib/listings";

interface AuthUser {
  sub: string;
  username: string;
  givenName: string;
  familyName: string;
  groups: string[];
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, attrs: SignUpAttributes) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseSession(session: CognitoUserSession): AuthUser {
  const idToken = session.getIdToken();
  const payload = idToken.decodePayload();
  const groups: string[] = payload["cognito:groups"] ?? [];

  return {
    sub: payload.sub,
    username: payload["cognito:username"] ?? payload.sub,
    givenName: payload["given_name"] ?? "",
    familyName: payload["family_name"] ?? "",
    groups,
    isAdmin: groups.includes("admin"),
  };
}

async function ensureProfile(username: string) {
  try {
    const profile = await fetchSellerProfile(username);
    if (!profile) {
      await createSellerProfile(username);
    }
  } catch {
    // non-blocking — profile will be created on next login
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentSession()
      .then((session) => {
        if (session) {
          const parsed = parseSession(session);
          setUser(parsed);
          ensureProfile(parsed.username);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (username: string, password: string) => {
    const session = await cognitoSignIn(username, password);
    const parsed = parseSession(session);
    setUser(parsed);
    ensureProfile(parsed.username);
  };

  const signUp = async (username: string, password: string, attrs: SignUpAttributes) => {
    await cognitoSignUp(username, password, attrs);
  };

  const refreshUser = async () => {
    const session = await refreshSession();
    setUser(parseSession(session));
  };

  const signOut = () => {
    cognitoSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
