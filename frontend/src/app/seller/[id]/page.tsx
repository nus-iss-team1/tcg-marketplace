"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProfileContent, ProfileSkeleton, type ProfileData } from "@/components/profile-content";
import { PageContainer } from "@/components/page-header";
import { ProfileHeader } from "@/components/profile-header";
import { Button } from "@/components/ui/button";
import { fetchSellerProfile } from "@/lib/listings";
import Link from "next/link";

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerProfile(id)
      .then((data) => {
        if (data) setProfile(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (profile) {
      document.title = `${profile.displayName} - HOUSE OF CARDS`;
    }
    return () => { document.title = "HOUSE OF CARDS"; };
  }, [profile]);

  const isOwnProfile = !!user && user.username === profile?.username;

  return (
    <PageContainer>
      <ProfileHeader
        title={profile?.displayName || "Seller"}
        username={profile?.username}
        backHref="/marketplace"
        action={
          isOwnProfile ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                Settings
              </Link>
            </Button>
          ) : undefined
        }
      />
      {loading ? (
        <ProfileSkeleton />
      ) : profile ? (
        <ProfileContent profile={profile} isOwnProfile={isOwnProfile} />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Seller not found.</p>
        </div>
      )}
    </PageContainer>
  );
}
