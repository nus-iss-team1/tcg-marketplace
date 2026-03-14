"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProfileContent, ProfileSkeleton, type ProfileData } from "@/components/profile-content";

import { ProfileHeader } from "@/components/profile-header";
import { Button } from "@/components/ui/button";
import { fetchSellerProfile } from "@/lib/listings";
import Link from "next/link";

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    fetchSellerProfile(id)
      .then((data) => {
        if (data) {
          setProfile(data);
        } else {
          setNotFoundState(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (notFoundState) {
    notFound();
  }

  useEffect(() => {
    if (profile) {
      document.title = `${profile.displayName} - VAULT OF CARDS`;
    }
    return () => { document.title = "VAULT OF CARDS"; };
  }, [profile]);

  const isOwnProfile = !!user && user.username === profile?.username;

  return (
    <>
      <ProfileHeader
        title={profile?.displayName || "Seller"}
        username={profile?.username}
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
      ) : null}
    </>
  );
}
