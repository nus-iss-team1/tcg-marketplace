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
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [loadingAttrs, setLoadingAttrs] = useState(true);
  const [saving, setSaving] = useState(false);
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
    setSaving(true);

    try {
      const attrs: Record<string, string> = {};
      if (email) attrs["email"] = email;
      if (firstName) attrs["given_name"] = firstName;
      if (lastName) attrs["family_name"] = lastName;
      attrs["address"] = address;
      await updateUserAttributes(attrs);
      toast.success("Profile updated successfully.");
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
      <Card className="w-full max-w-2xl animate-[fade-up_0.4s_ease-out_both]">
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
          {profileError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-sm font-medium">{email}</p>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Username</Label>
              <p className="text-sm font-medium">{user?.username}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
