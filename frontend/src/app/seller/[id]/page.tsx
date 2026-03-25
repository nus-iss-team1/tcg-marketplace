"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProfileContent, ProfileSkeleton, type ProfileData } from "@/components/profile-content";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchSellerProfile } from "@/lib/listings";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [notFoundState, setNotFoundState] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/seller/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [id]);

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

  const displayName = profile?.displayName || "Seller";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Profile card */}
      <div className="mb-2 py-4 animate-[fade-up_0.4s_ease-out_both]">
        {/* Banner: Avatar + Name + Meta */}
        <div className="flex items-start gap-4 md:gap-10">
          <div className="flex items-center gap-4 shrink-0 min-w-0">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-medium truncate">{displayName}</h1>
                {isOwnProfile && <Badge variant="secondary" className="text-xs">You</Badge>}
              </div>
              {profile?.username && (
                <p className="text-xs text-muted-foreground">@{profile.username}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">Lives in Singapore</p>
              {profile?.joinedAt && (
                <span className="text-xs text-muted-foreground mt-0.5 block">
                  Joined {new Date(profile.joinedAt).toLocaleDateString()}
                </span>
              )}
              {profile?.address && (
                <p className="text-xs text-muted-foreground mt-0.5">{profile.address}</p>
              )}
            </div>
          </div>

        </div>

        {/* Bio */}
        <div className="mt-8 px-4">
          {profile?.bio ? (
            <p className="text-sm text-muted-foreground normal-case tracking-normal">{profile.bio}</p>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic">No bio yet</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 px-4 flex items-center gap-2">
          {isOwnProfile && (
            <Button size="sm" asChild>
              <Link href="/settings">Edit Profile</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleShare}>
            {copied ? "Copied!" : "Share"}
          </Button>
        </div>

        <Separator className="mt-6" />
      </div>

      {loading ? (
        <ProfileSkeleton />
      ) : profile ? (
        <ProfileContent profile={profile} isOwnProfile={isOwnProfile} />
      ) : null}
    </div>
  );
}
