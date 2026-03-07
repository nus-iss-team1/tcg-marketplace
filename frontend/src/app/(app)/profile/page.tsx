"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserAttributes,
  updateUserAttributes,
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
import { UserIcon, SaveIcon } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingAttrs, setLoadingAttrs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    getUserAttributes()
      .then((attrs) => {
        setEmail(attrs["email"] ?? "");
        setName(attrs["name"] ?? "");
        setPhone(attrs["phone_number"] ?? "");
      })
      .catch(() => {})
      .finally(() => setLoadingAttrs(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileError("");
    setSaving(true);

    try {
      const attrs: Record<string, string> = {};
      if (email) attrs["email"] = email;
      if (name) attrs["name"] = name;
      if (phone) attrs["phone_number"] = phone;
      await updateUserAttributes(attrs);
      setProfileMsg("Profile updated successfully.");
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingAttrs) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-2xl">
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
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          {profileMsg && (
            <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-500">
              {profileMsg}
            </div>
          )}
          {profileError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Username</Label>
              <p className="text-sm font-medium">{user?.username}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-name">Display Name</Label>
              <Input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-phone">Phone Number</Label>
              <Input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full sm:w-auto self-end mt-2">
              <SaveIcon className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
