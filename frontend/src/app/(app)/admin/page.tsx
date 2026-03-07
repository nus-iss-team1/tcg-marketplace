"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !user.isAdmin) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <ShieldIcon className="h-7 w-7 sm:h-8 sm:w-8 text-amber-500" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Super Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome, <strong>{user.username}</strong>
          </p>
        </div>
        <Badge variant="default" className="sm:ml-2 w-fit">
          Super Admin
        </Badge>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Manage Users</p>
            <p className="text-sm text-muted-foreground">
              View, edit, and assign roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Manage Listings</p>
            <p className="text-sm text-muted-foreground">
              Review and moderate marketplace listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">System Settings</p>
            <p className="text-sm text-muted-foreground">
              Configure platform settings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
