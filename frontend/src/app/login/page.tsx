"use client";

import { Suspense, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmSignUp, resendConfirmationCode, forgotPassword, confirmForgotPassword } from "@/lib/cognito";
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
import { toast } from "sonner";

function AuthForm() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const redirectTo = searchParams.get("redirect") || "/marketplace";
  const initialTab = tabParam === "signup" ? "signup" : "signin";

  useEffect(() => {
    document.title = "Login - VAULT OF CARDS";
  }, []);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const [verifyUsername, setVerifyUsername] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<"request" | "confirm">("request");
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.replace(`/login?tab=${value}`, { scroll: false });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      await signIn(loginUsername, loginPassword);
      router.push(redirectTo);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSignupLoading(true);

    try {
      await signUp(signupUsername, signupPassword, {
        email: signupEmail,
        givenName: signupFirstName,
        familyName: signupLastName,
        address: signupAddress,
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
        toast.error("This username is already taken.");
      } else {
        toast.error(message);
      }
    } finally {
      setSignupLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);

    try {
      await confirmSignUp(verifyUsername, verifyCode);
      setShowVerify(false);
      setVerifyCode("");
      toast.success("Account created successfully. Please sign in.");
      handleTabChange("signin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);

    try {
      await resendConfirmationCode(verifyUsername);
      toast.success("A new code has been sent to your email.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await forgotPassword(forgotUsername);
      toast.success("If an account with this username exists, a reset code has been sent to the associated email.");
      setForgotStep("confirm");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset code");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setForgotLoading(true);
    try {
      await confirmForgotPassword(forgotUsername, forgotCode, forgotNewPassword);
      toast.success("Password reset successfully. Please sign in.");
      setShowForgotPassword(false);
      setForgotStep("request");
      setForgotUsername("");
      setForgotCode("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
      setActiveTab("signin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-xl animate-[fade-up_0.4s_ease-out_both]">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>{forgotStep === "request" ? "Forgot Password" : "Reset Password"}</CardTitle>
              <CardDescription>
                {forgotStep === "request"
                  ? "Enter your username. If an account exists, a reset code will be sent to the associated email."
                  : "Enter the code from your email and your new password."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forgotStep === "request" ? (
                <form onSubmit={handleForgotRequest} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="forgot-username">Username</Label>
                    <Input
                      id="forgot-username"
                      type="text"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <Button type="submit" disabled={forgotLoading} className="w-full">
                    {forgotLoading ? "Sending..." : "Send Reset Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleForgotConfirm} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="forgot-code">Verification Code</Label>
                    <Input
                      id="forgot-code"
                      type="text"
                      inputMode="numeric"
                      placeholder="ENTER 6-DIGIT CODE"
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="forgot-new-password">New Password</Label>
                    <Input
                      id="forgot-new-password"
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Min 8 characters, uppercase, lowercase, and number required
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="forgot-confirm-password">Confirm New Password</Label>
                    <Input
                      id="forgot-confirm-password"
                      type="password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    {forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword && (
                      <p className="text-xs text-destructive">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={forgotLoading || (!!forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword)} className="w-full">
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              )}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotStep("request");
                    setForgotUsername("");
                    setForgotCode("");
                    setForgotNewPassword("");
                    setForgotConfirmPassword("");
                  }}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showVerify) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-xs mx-auto animate-[fade-up_0.4s_ease-out_both]">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Verify your email</CardTitle>
              <CardDescription>
                We sent a verification code to your email. Enter it below to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="verify-code">Verification Code</Label>
                  <Input
                    id="verify-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="ENTER 6-DIGIT CODE"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <Button type="submit" disabled={verifyLoading} className="w-full">
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
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-xl animate-[fade-up_0.4s_ease-out_both]">
          <Card className="bg-background">
            <CardContent className="pt-4 pb-8">

            {activeTab === "signin" ? (
              <>
                <CardHeader className="px-0 pt-0 pb-4">
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>
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

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-muted-foreground hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button type="submit" disabled={loginLoading} className="mt-2 w-full">
                    {loginLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("signup")}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              </>
            ) : (
              <>
                <CardHeader className="px-0 pt-0 pb-4">
                  <CardTitle>Create account</CardTitle>
                  <CardDescription>
                    Join the marketplace to buy, sell, and trade cards
                  </CardDescription>
                </CardHeader>

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
                    <Label htmlFor="signup-address">Address</Label>
                    <Input
                      id="signup-address"
                      type="text"
                      value={signupAddress}
                      onChange={(e) => setSignupAddress(e.target.value)}
                      required
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
                    {signupLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("signin")}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </>
            )}
            </CardContent>
          </Card>
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
