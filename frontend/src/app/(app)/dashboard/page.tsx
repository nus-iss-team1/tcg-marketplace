"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-semibold">
        {user ? `Welcome back` : "Welcome to TCG Marketplace"}
      </h1>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Browse Cards</p>
            <p className="text-sm text-muted-foreground">
              Explore the latest listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">My Cards</p>
            <p className="text-sm text-muted-foreground">
              Manage your collection
            </p>
          </CardContent>
        </Card>

        {user?.isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Dashboard</p>
              <p className="text-sm text-muted-foreground">
                Manage users and listings
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
