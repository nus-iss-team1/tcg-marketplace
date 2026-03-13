"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ChevronLeftIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  LayersIcon,
  SparklesIcon,
  HashIcon,
  UploadIcon,
  Trash2Icon,
} from "lucide-react";
import { fetchMarketplaceListings, type Listing } from "@/lib/listings";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/page-header";
import { AppHeader } from "@/components/app-header";
import { useAuth } from "@/context/AuthContext";
import { ImagePlaceholder } from "@/components/image-placeholder";

export default function ViewListingPage() {
  return (
    <Suspense>
      <ViewListingContent />
    </Suspense>
  );
}

function ViewListingContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with single listing fetch when API is ready
    fetchMarketplaceListings("Pokemon TCG", { limit: 1 })
      .then((res) => setListing(res.listings[0] ?? null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (listing) {
      document.title = `${listing.cardName} - TCG Marketplace`;
    }
    return () => { document.title = "TCG Marketplace"; };
  }, [listing]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col items-center p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="flex flex-1 flex-col w-full max-w-352 mx-auto px-4 sm:px-0">
            <div className="space-y-4">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="w-48 sm:w-56 md:w-64 mx-auto aspect-3/4 rounded-none" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col items-center p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="flex flex-1 flex-col items-center justify-center w-full max-w-352 mx-auto px-4 sm:px-0">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:w-auto sm:px-3 self-start mb-4" asChild>
              <Link href="/marketplace">
                <ChevronLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            <p className="text-lg">Listing Not Found</p>
            <p className="text-muted-foreground text-xs">This listing doesn&apos;t exist or has been removed.</p>
          </div>
        </main>
      </div>
    );
  }

  // Only allow edit mode for authenticated users
  if (isEdit && user) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col items-center p-4 sm:p-5 md:p-6 lg:p-8">
          <EditListingView listing={listing} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center p-4 sm:p-5 md:p-6 lg:p-8">
        <ReadListingView listing={listing} isAuthenticated={!!user} />
      </main>
    </div>
  );
}

function ReadListingView({ listing, isAuthenticated }: { listing: Listing; isAuthenticated: boolean }) {
  const sellerInitials = listing.sellerName.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-1 flex-col w-full max-w-352 mx-auto px-4 sm:px-0 animate-[fade-up_0.4s_ease-out_both]">
      {/* Back & Edit buttons */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/marketplace">
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        {isAuthenticated && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/listing/sample?edit=true">
              Edit
            </Link>
          </Button>
        )}
      </div>

      {/* Card images banner */}
      <ImageBanner attachment={listing.attachment} />

      {/* Card name and game type */}
      <div className="mt-4 mb-2">
        <p className="text-xs text-muted-foreground">{listing.gameName}</p>
        <h1 className="text-3xl sm:text-4xl font-heading">{listing.cardName}</h1>
      </div>

      {/* Price */}
      <p className="text-lg sm:text-xl text-primary mb-4">
        ${listing.price}
      </p>

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        {listing.listingStatus && (
          <Badge variant={listing.listingStatus === "ACTIVE" ? "default" : "secondary"}>
            {listing.listingStatus}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <CalendarIcon className="h-3.5 w-3.5" />
          Listed {new Date(listing.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <Separator />

      {/* Card details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
        {listing.setName && (
          <div className="flex items-center gap-2 text-xs">
            <LayersIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Set:</span>
            <span>{listing.setName}</span>
          </div>
        )}
        {listing.cardId && (
          <div className="flex items-center gap-2 text-xs">
            <HashIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Card ID:</span>
            <span>{listing.cardId}</span>
          </div>
        )}
        {listing.rarity && (
          <div className="flex items-center gap-2 text-xs">
            <SparklesIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Rarity:</span>
            <span>{listing.rarity}</span>
          </div>
        )}
        {listing.pickUp && (
          <div className="flex items-center gap-2 text-xs">
            <MapPinIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Pickup:</span>
            <span>{listing.pickUp}</span>
          </div>
        )}
        {listing.paymentMethod && (
          <div className="flex items-center gap-2 text-xs">
            <CreditCardIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Payment:</span>
            <span>
              {[
                listing.paymentMethod.cash && "Cash",
                listing.paymentMethod.paynow && "PayNow",
                listing.paymentMethod.bank && "Bank Transfer",
              ]
                .filter(Boolean)
                .join(", ") || "—"}
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Seller */}
      <div className="my-4">
        <p className="text-xs text-muted-foreground mb-2">Seller</p>
        <div className="flex items-center gap-3 p-2 -m-2 min-w-0 overflow-hidden">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs">{sellerInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs truncate">{listing.sellerName}</span>
            <span className="text-xs text-muted-foreground truncate">@{listing.sellerId}</span>
          </div>
        </div>
      </div>

      {/* Action — only for authenticated users */}
      {isAuthenticated && (
        <div className="flex gap-3 pt-2">
          <Button className="flex-1 sm:flex-none" asChild>
            <Link href={`/seller/${listing.sellerId}`}>
              Contact Seller
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function EditListingView({ listing }: { listing: Listing }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cardName, setCardName] = useState(listing.cardName);
  const [setName, setSetNameValue] = useState(listing.setName || "");
  const [cardId, setCardId] = useState(listing.cardId || "");
  const [rarity, setRarity] = useState(listing.rarity || "");
  const [price, setPrice] = useState(listing.price);
  const [pickUp, setPickUp] = useState(listing.pickUp || "");

  const [frontPreview, setFrontPreview] = useState<string | null>(
    listing.attachment?.front || null
  );
  const [backPreview, setBackPreview] = useState<string | null>(
    listing.attachment?.back || null
  );
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"front" | "back">("front");

  const canSubmit = cardName && price && Number(price) > 0;

  const handleOpenUpload = (target: "front" | "back") => {
    setUploadTarget(target);
    setUploadDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (uploadTarget === "front") {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontPreview(previewUrl);
    } else {
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackPreview(previewUrl);
    }
    setUploadDialogOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (target: "front" | "back") => {
    if (target === "front") {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontPreview(null);
    } else {
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call updateListing API
    toast.success("Listing updated successfully.");
    router.push("/listing/sample");
  };

  return (
    <PageContainer>
      <PageHeader title="Edit Listing" description="Update your listing details" backHref="/listing/sample" />
      <form onSubmit={handleSubmit} className="animate-[fade-up_0.4s_ease-out_both]">
        {/* Image upload banner */}
        <div className="flex justify-center gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
          {frontPreview ? (
            <div className="w-48 sm:w-56 md:w-64 shrink-0 aspect-3/4 rounded-none bg-muted overflow-hidden snap-start relative group">
              <Image
                src={frontPreview}
                alt="Card front"
                width={256}
                height={341}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-none flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenUpload("front")}
                >
                  <UploadIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveImage("front")}
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenUpload("front")}
              className="w-48 sm:w-56 md:w-64 shrink-0 aspect-3/4 rounded-none border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center gap-1.5 hover:border-muted-foreground/50 hover:bg-muted transition-colors cursor-pointer snap-start"
            >
              <UploadIcon className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Front</span>
            </button>
          )}

          {backPreview ? (
            <div className="w-48 sm:w-56 md:w-64 shrink-0 aspect-3/4 rounded-none bg-muted overflow-hidden snap-start relative group">
              <Image
                src={backPreview}
                alt="Card back"
                width={256}
                height={341}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-none flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenUpload("back")}
                >
                  <UploadIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveImage("back")}
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenUpload("back")}
              className="w-48 sm:w-56 md:w-64 shrink-0 aspect-3/4 rounded-none border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center gap-1.5 hover:border-muted-foreground/50 hover:bg-muted transition-colors cursor-pointer snap-start"
            >
              <UploadIcon className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Back</span>
            </button>
          )}
        </div>

        {/* Game (read-only) & Card Name */}
        <div className="mt-4 mb-2">
          <p className="text-xs text-muted-foreground">{listing.gameName}</p>
          <div className="space-y-2 mt-1">
            <Label htmlFor="cardName">Card Name *</Label>
            <Input
              id="cardName"
              placeholder="e.g. Charizard VMAX"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              maxLength={100}
              className="h-9"
            />
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2 my-4">
          <Label htmlFor="price">Price (SGD) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-9"
          />
        </div>

        <Separator />

        {/* Card details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div className="space-y-2">
            <Label htmlFor="setName">Set Name</Label>
            <Input
              id="setName"
              placeholder="e.g. Darkness Ablaze"
              value={setName}
              onChange={(e) => setSetNameValue(e.target.value)}
              maxLength={100}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardId">Card ID</Label>
            <Input
              id="cardId"
              placeholder="e.g. 020/189"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              maxLength={100}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rarity">Rarity</Label>
            <Input
              id="rarity"
              placeholder="e.g. Ultra Rare"
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
              maxLength={100}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup Location</Label>
            <Input
              id="pickup"
              placeholder="e.g. Jurong East MRT"
              value={pickUp}
              onChange={(e) => setPickUp(e.target.value)}
              maxLength={100}
              className="h-9"
            />
          </div>
        </div>

        <Separator />

        {/* Submit */}
        <div className="flex gap-3 my-4">
          <Button type="submit" disabled={!canSubmit} className="flex-1 sm:flex-none">
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/listing/sample")}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Upload {uploadTarget === "front" ? "Front" : "Back"} Image
            </DialogTitle>
            <DialogDescription>
              Select an image of the {uploadTarget === "front" ? "front" : "back"} of your card. Supported formats: JPG, PNG, WebP.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <UploadIcon className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm">Click to select a file</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP up to 5MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function ImageBanner({ attachment }: { attachment?: { front?: string; back?: string } }) {
  const images = [attachment?.front, attachment?.back].filter(Boolean) as string[];

  if (images.length === 0) {
    return (
      <div className="flex justify-center gap-3 overflow-x-auto pb-2">
        <ImagePlaceholder className="w-48 sm:w-56 md:w-64 shrink-0 rounded-none" />
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
      {images.map((src, i) => (
        <div
          key={i}
          className="w-48 sm:w-56 md:w-64 shrink-0 aspect-3/4 rounded-none bg-muted overflow-hidden snap-start"
        >
          <Image
            src={src}
            alt={`Card image ${i + 1}`}
            width={256}
            height={341}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
