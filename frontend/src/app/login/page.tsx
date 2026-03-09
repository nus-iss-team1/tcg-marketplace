"use client";

import { Suspense, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmSignUp, resendConfirmationCode } from "@/lib/cognito";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogInIcon, MailCheckIcon, UserPlusIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";

function AuthForm() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const redirectTo = searchParams.get("redirect") || "/marketplace";
  const initialTab = tabParam === "signup" ? "signup" : "signin";

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [verifyUsername, setVerifyUsername] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [showVerify, setShowVerify] = useState(false);

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
      router.push(redirectTo);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setUsernameError("");

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }

    setSignupLoading(true);

    try {
      await signUp(signupUsername, signupPassword, {
        email: signupEmail,
        givenName: signupFirstName,
        familyName: signupLastName,
        address: signupAddress || undefined,
      });
      setVerifyUsername(signupUsername);
      setShowVerify(true);
      setSignupUsername("");
      setSignupEmail("");
      setSignupFirstName("");
      setSignupLastName("");
      setSignupAddress("");
      setSignupPassword("");
      setSignupConfirmPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign up";
      const code = (err as { code?: string })?.code;
      if (code === "UsernameExistsException") {
        setUsernameError("This username is already taken.");
      } else {
        setSignupError(message);
      }
    } finally {
      setSignupLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    setVerifyLoading(true);

    try {
      await confirmSignUp(verifyUsername, verifyCode);
      setShowVerify(false);
      setVerifyCode("");
      setSignupSuccess(true);
      handleTabChange("signin");
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendMsg("");
    setVerifyError("");
    setResending(true);

    try {
      await resendConfirmationCode(verifyUsername);
      setResendMsg("A new code has been sent to your email.");
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  if (showVerify) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-lg lg:max-w-xl animate-[fade-up_0.4s_ease-out_both]">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Verify your email</CardTitle>
                <CardDescription>
                  We sent a verification code to your email. Enter it below to activate your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verifyError && (
                  <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {verifyError}
                  </div>
                )}
                {resendMsg && (
                  <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-500">
                    {resendMsg}
                  </div>
                )}

                <form onSubmit={handleVerify} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="verify-code">Verification Code</Label>
                    <Input
                      id="verify-code"
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 6-digit code"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <Button type="submit" disabled={verifyLoading} className="w-full">
                    <MailCheckIcon className="h-4 w-4 mr-2" />
                    {verifyLoading ? "Verifying..." : "Verify Email"}
                  </Button>
                </form>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Didn&apos;t receive a code?{" "}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resending}
                    className="text-primary underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    {resending ? "Resending..." : "Resend code"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-lg lg:max-w-xl animate-[fade-up_0.4s_ease-out_both]">
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
                <div className="mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
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
                  <LogInIcon className="h-4 w-4 mr-2" />
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
                    onChange={(e) => {
                      setSignupUsername(e.target.value);
                      if (usernameError) setUsernameError("");
                    }}
                    required
                    aria-invalid={!!usernameError}
                  />
                  {usernameError && (
                    <p className="text-xs text-destructive">{usernameError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-first-name">First Name</Label>
                    <Input
                      id="signup-first-name"
                      type="text"
                      value={signupFirstName}
                      onChange={(e) => setSignupFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-last-name">Last Name</Label>
                    <Input
                      id="signup-last-name"
                      type="text"
                      value={signupLastName}
                      onChange={(e) => setSignupLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for verification and password resets
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-address">Address (optional)</Label>
                  <Input
                    id="signup-address"
                    type="text"
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
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

                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  {signupConfirmPassword && signupPassword !== signupConfirmPassword && (
                    <p className="text-xs text-destructive">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={signupLoading || (!!signupConfirmPassword && signupPassword !== signupConfirmPassword)} className="mt-2 w-full">
                  <UserPlusIcon className="h-4 w-4 mr-2" />
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
