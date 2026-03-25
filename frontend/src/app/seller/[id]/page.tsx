"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProfileContent, ProfileSkeleton, type ProfileData } from "@/components/profile-content";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const displayName = profile?.displayName || "Seller";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Profile card */}
      <div className="mb-8 py-4 animate-[fade-up_0.4s_ease-out_both]">
        {/* Desktop: 4-column layout | Mobile: stacked */}
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-10">
          {/* Col 1+2: Avatar + Name */}
          <div className="flex items-start gap-4 shrink-0 min-w-0">
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
              {profile?.address && (
                <p className="text-xs text-muted-foreground mt-0.5">{profile.address}</p>
              )}
            </div>
          </div>

          {/* Col 3: Bio */}
          <div className="flex-1 min-w-0">
            {profile?.bio ? (
              <p className="text-xs text-muted-foreground italic line-clamp-3">&ldquo;{profile.bio}&rdquo;</p>
            ) : (
              <p className="text-xs text-muted-foreground/50 italic">No bio yet</p>
            )}
          </div>

          {/* Col 4: Meta + Edit */}
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1">
            {profile?.joinedAt && (
              <span className="text-xs text-muted-foreground">
                Joined {new Date(profile.joinedAt).toLocaleDateString()}
              </span>
            )}
            {profile?.preferredPayment && (profile.preferredPayment.cash || profile.preferredPayment.paynow || profile.preferredPayment.bank) && (
              <span className="text-xs text-muted-foreground">
                Accepts: {[
                  profile.preferredPayment.cash && "Cash",
                  profile.preferredPayment.paynow && "PayNow",
                  profile.preferredPayment.bank && "Bank Transfer",
                ].filter(Boolean).join(", ")}
              </span>
            )}
            {isOwnProfile && (
              <Button variant="ghost" size="sm" asChild className="mt-1 -ml-3 md:ml-0 md:-mr-3">
                <Link href="/settings">
                  Edit Profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <ProfileSkeleton />
      ) : profile ? (
        <ProfileContent profile={profile} isOwnProfile={isOwnProfile} />
      ) : null}
    </div>
  );
}
