"use client";

import { Suspense, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AuthForm() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "signup" ? "signup" : "signin";

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.replace(`/login?tab=${value}`, { scroll: false });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      await signIn(loginUsername, loginPassword);
      router.push("/");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);

    try {
      await signUp(signupUsername, signupPassword, signupEmail || undefined);
      setSignupSuccess(true);
      setSignupUsername("");
      setSignupEmail("");
      setSignupPassword("");
      handleTabChange("signin");
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="pt-4 pb-8">

            <TabsContent value="signin">
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>
              {signupSuccess && (
                <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-500">
                  Account created successfully. Please sign in.
                </div>
              )}

              {loginError && (
                <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={loginLoading} className="mt-2 w-full">
                  {loginLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-2xl">Create account</CardTitle>
                <CardDescription>
                  Join the marketplace to buy, sell, and trade cards
                </CardDescription>
              </CardHeader>

              {signupError && (
                <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {signupError}
                </div>
              )}

              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-email">Email (optional)</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Min 8 characters, uppercase, lowercase, and number required
                  </p>
                </div>

                <Button type="submit" disabled={signupLoading} className="mt-2 w-full">
                  {signupLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
