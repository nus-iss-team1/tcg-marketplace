"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProfileContent, ProfileSkeleton } from "@/components/profile-content";
import { PageContainer } from "@/components/page-header";
import { ProfileHeader } from "@/components/profile-header";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = "Profile - VAULT OF CARDS";
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
    <PageContainer>
      <ProfileHeader
        title={profile?.displayName || "My Profile"}
        username={profile?.username}
        backHref="/marketplace"
        badge={<Badge variant="secondary" className="text-xs">You</Badge>}
      />
      {loading ? (
        <ProfileSkeleton />
      ) : profile ? (
        <ProfileContent profile={profile} isOwnProfile />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Profile not found.</p>
        </div>
      )}
    </PageContainer>
  );
}
