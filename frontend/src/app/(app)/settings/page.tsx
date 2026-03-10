"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserAttributes,
  updateUserAttributes,
  changePassword,
} from "@/lib/cognito";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserIcon,
  SaveIcon,
  KeyRoundIcon,
  PaletteIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Theme helpers ── */

function subscribeTheme(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === "theme") callback();
  };
  window.addEventListener("storage", onStorage);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => {
    window.removeEventListener("storage", onStorage);
    observer.disconnect();
  };
}

function getThemeSnapshot(): "light" | "dark" | "system" {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return "system";
}

function getServerThemeSnapshot(): "light" | "dark" | "system" {
  return "system";
}

const THEMES = [
  { value: "light" as const, label: "Light", icon: SunIcon },
  { value: "dark" as const, label: "Dark", icon: MoonIcon },
  { value: "system" as const, label: "System", icon: MonitorIcon },
];

/* ── Nav sections ── */

const SECTIONS = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "password", label: "Change Password", icon: KeyRoundIcon },
  { id: "appearance", label: "Appearance", icon: PaletteIcon },
];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  /* ── Active section tracking ── */
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    for (const { id } of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ── Profile state ── */
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [loadingAttrs, setLoadingAttrs] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    getUserAttributes()
      .then((attrs) => {
        setEmail(attrs["email"] ?? "");
        setFirstName(attrs["given_name"] ?? "");
        setLastName(attrs["family_name"] ?? "");
        setAddress(attrs["address"] ?? "");
      })
      .catch(() => {})
      .finally(() => setLoadingAttrs(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setSavingProfile(true);
    try {
      const attrs: Record<string, string> = {};
      if (email) attrs["email"] = email;
      if (firstName) attrs["given_name"] = firstName;
      if (lastName) attrs["family_name"] = lastName;
      attrs["address"] = address;
      await updateUserAttributes(attrs);
      await refreshUser();
      toast.success("Profile updated successfully.");
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── Password state ── */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  /* ── Theme state ── */
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const setTheme = useCallback((value: "light" | "dark" | "system") => {
    localStorage.setItem("theme", value);
    if (value === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", value === "dark");
    }
  }, []);

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-6 md:gap-8 w-full max-w-5xl mx-auto">
      {/* Sidebar nav */}
      <nav className="w-full md:w-56 shrink-0 md:sticky md:top-20 md:self-start">
        <h2 className="text-lg font-semibold mb-3 px-2">Settings</h2>
        <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => scrollTo(id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap w-full cursor-pointer",
                  activeSection === id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content sections */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Profile */}
        <section id="profile">
          {loadingAttrs ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Profile Details</CardTitle>
                  {user?.isAdmin && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profileError && (
                  <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {profileError}
                  </div>
                )}
                <form
                  onSubmit={handleSaveProfile}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-sm font-medium">{email}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-muted-foreground">Username</Label>
                    <p className="text-sm font-medium">{user?.username}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="profile-first-name">First Name</Label>
                      <Input
                        id="profile-first-name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="profile-last-name">Last Name</Label>
                      <Input
                        id="profile-last-name"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-address">Address (optional)</Label>
                    <Input
                      id="profile-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full sm:w-auto self-end mt-2"
                  >
                    <SaveIcon className="mr-2 h-4 w-4" />
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Change Password */}
        <section id="password">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRoundIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Change Password</CardTitle>
              </div>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              {passwordError && (
                <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {passwordError}
                </div>
              )}
              <form
                onSubmit={handleChangePassword}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm-password">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full sm:w-auto self-end mt-2"
                >
                  <SaveIcon className="mr-2 h-4 w-4" />
                  {savingPassword ? "Saving..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Appearance */}
        <section id="appearance">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PaletteIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Appearance</CardTitle>
              </div>
              <CardDescription>
                Customize the look and feel of the app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-colors cursor-pointer",
                        theme === value
                          ? "border-primary bg-muted"
                          : "border-transparent hover:border-muted-foreground/25"
                      )}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
