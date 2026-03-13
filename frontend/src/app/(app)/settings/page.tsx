"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/page-header";

/* ── Nav sections ── */

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "password", label: "Change Password" },
];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    document.title = "Settings - TCG Marketplace";
  }, []);

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
      toast.error(
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
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
      const message =
        err instanceof Error && err.message.toLowerCase().includes("password")
          ? "Incorrect password."
          : err instanceof Error
            ? err.message
            : "Failed to change password.";
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loadingAttrs) {
    return (
      <PageContainer>
        <PageHeader title="Settings" />
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
          {/* Content skeleton */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <Skeleton className="h-72 w-full rounded-none" />
            <Skeleton className="h-56 w-full rounded-none" />
            <Skeleton className="h-48 w-full rounded-none" />
          </div>
          {/* TOC skeleton */}
          <div className="hidden md:block w-44 shrink-0">
            <Skeleton className="h-3 w-20 mb-3" />
            <div className="flex flex-col gap-2 pl-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Manage your account" />
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
        {/* Content sections */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 order-2 md:order-1">
        {/* Profile */}
        <section id="profile" className="animate-[fade-up_0.4s_ease-out_both]" style={{ animationDelay: "0s" }}>
            <Card className="bg-background">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Profile Details</CardTitle>
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
                <form
                  onSubmit={handleSaveProfile}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-sm normal-case">{email}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-muted-foreground">Username</Label>
                    <p className="text-sm normal-case">{user?.username}</p>
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
                                        {savingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
        </section>

        {/* Change Password */}
        <section id="password" className="animate-[fade-up_0.4s_ease-out_both]" style={{ animationDelay: "0.1s" }}>
          <Card className="bg-background">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
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
                                    {savingPassword ? "Saving..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

      
      </div>

        {/* Table of contents nav — hidden on mobile, right side on md+ */}
        <nav className="hidden md:block w-44 shrink-0 sticky top-20 self-start order-2">
          <p className="text-xs text-muted-foreground mb-3">On this page</p>
          <ul className="flex flex-col border-l border-border">
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => scrollTo(id)}
                  className={cn(
                    "block w-full text-left text-[13px] py-1.5 pl-3 -ml-px border-l-2 transition-colors cursor-pointer",
                    activeSection === id
                      ? "border-primary text-foreground font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                  )}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </PageContainer>
  );
}
