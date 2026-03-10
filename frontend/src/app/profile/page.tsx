"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/app-header";
import { ProfileContent, ProfileSkeleton } from "@/components/profile-content";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = "Profile - TCG Marketplace";
  }, []);

  const profile = useMemo(() => {
    if (!user) return null;
    return {
      username: user.username,
      displayName: user.givenName
        ? `${user.givenName}${user.familyName ? ` ${user.familyName}` : ""}`
        : user.username,
    };
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="flex flex-1 flex-col w-full max-w-352 mx-auto px-4 sm:px-0">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:w-auto sm:px-3" asChild>
              <Link href="/marketplace">
                <ChevronLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:w-auto sm:px-3" asChild>
              <Link href="/settings">
                <SettingsIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </Button>
          </div>

          {loading ? (
            <ProfileSkeleton />
          ) : profile ? (
            <ProfileContent profile={profile} isOwnProfile />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground">Profile not found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
