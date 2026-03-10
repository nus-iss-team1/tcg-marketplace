"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/app-header";
import { ProfileContent, ProfileSkeleton, type ProfileData } from "@/components/profile-content";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, SettingsIcon } from "lucide-react";
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
      document.title = `${profile.displayName} - TCG Marketplace`;
    }
    return () => { document.title = "TCG Marketplace"; };
  }, [profile]);

  const isOwnProfile = !!user && user.username === profile?.username;

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
            {isOwnProfile && (
              <Button variant="outline" size="icon" className="h-8 w-8 sm:w-auto sm:px-3" asChild>
                <Link href="/settings">
                  <SettingsIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
              </Button>
            )}
          </div>

          {loading ? (
            <ProfileSkeleton />
          ) : profile ? (
            <ProfileContent profile={profile} isOwnProfile={isOwnProfile} />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground">Seller not found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
