"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CalendarIcon,
  UploadIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";
import { fetchSpecificListing, updateListing, deleteListing, type Listing, type PaymentMethod } from "@/lib/listings";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
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
  const params = useParams();
  const searchParams = useSearchParams();
  const listingId = params.listingId as string;
  const gameName = searchParams.get("game") || "";
  const isEdit = searchParams.get("edit") === "true";

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(!!gameName && !!listingId);
  const [error, setError] = useState(!gameName || !listingId);

  useEffect(() => {
    if (!gameName || !listingId) return;
    fetchSpecificListing(gameName, listingId)
      .then((data) => {
        setListing(data);
      })
      .catch((err) => {
        console.error("Fetch listing error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [gameName, listingId]);

  useEffect(() => {
    if (listing) {
      document.title = `${listing.cardName} - VAULT OF CARDS`;
    }
    return () => { document.title = "VAULT OF CARDS"; };
  }, [listing]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="w-48 sm:w-56 md:w-64 mx-auto aspect-5/7 rounded-none" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-lg">Listing Not Found</p>
        <p className="text-muted-foreground text-xs">This listing doesn&apos;t exist or has been removed.</p>
      </div>
    );
  }

  const isOwner = user?.username === listing.sellerId;

  if (isEdit && isOwner) {
    return <EditListingView listing={listing} />;
  }

  return <ReadListingView listing={listing} isOwner={isOwner} />;
}

function ReadListingView({ listing, isOwner }: { listing: Listing; isOwner: boolean }) {
  const displayName = listing.sellerName || listing.sellerId || "Unknown";
  const sellerInitials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-1 flex-col w-full animate-[fade-up_0.4s_ease-out_both] px-0 sm:px-4 md:px-12 lg:px-24 xl:px-48">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-16">
        {/* Left — Images */}
        <div className="w-3/5 sm:w-3/5 md:w-2/5 mx-auto lg:mx-0 lg:w-1/2 xl:w-2/5 shrink-0">
          <ImageCarousel attachment={listing.attachment} />
        </div>

        {/* Right — Details */}
        <div className="flex-1 min-w-0 lg:sticky lg:top-16 lg:self-start">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">{listing.gameName}</p>
            {isOwner && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/listing/${listing.listingId}?game=${encodeURIComponent(listing.gameName)}&edit=true`}>
                  Edit
                </Link>
              </Button>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading">{listing.title || listing.cardName}</h1>
          {listing.title && (
            <p className="text-sm text-muted-foreground mt-1">{listing.cardName}</p>
          )}

          <p className="text-lg sm:text-xl text-primary mt-2 mb-4">
            ${Number(listing.price).toFixed(2)}
          </p>

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

          <div className="grid grid-cols-1 gap-3 my-4">
            {listing.setName && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Set:</span>
                <span>{listing.setName}</span>
              </div>
            )}
            {listing.cardId && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Card ID:</span>
                <span>{listing.cardId}</span>
              </div>
            )}
            {listing.rarity && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Rarity:</span>
                <span>{listing.rarity}</span>
              </div>
            )}
            {listing.pickUp && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Pickup:</span>
                <span>{listing.pickUp}</span>
              </div>
            )}
            {listing.paymentMethod && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Payment:</span>
                <span>
                  {[
                    listing.paymentMethod.cash && "Cash",
                    listing.paymentMethod.paynow && "PayNow",
                    listing.paymentMethod.bank && "Bank Transfer",
                  ]
                    .filter(Boolean)
                    .join(", ") || "\u2014"}
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div className="my-4">
            <p className="text-xs text-muted-foreground mb-2">Seller</p>
            <Link href={`/seller/${listing.sellerId}`} className="flex items-center gap-3 p-2 -m-2 min-w-0 overflow-hidden hover:bg-muted/50 rounded-md transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">{sellerInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs truncate">{displayName}</span>
                <span className="text-xs text-muted-foreground truncate">@{listing.sellerId}</span>
              </div>
            </Link>
          </div>

          {!isOwner && (
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 sm:flex-none" asChild>
                <Link href={`/seller/${listing.sellerId}`}>
                  Contact Seller
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditListingView({ listing }: { listing: Listing }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cardName, setCardName] = useState(listing.cardName);
  const [title, setTitle] = useState(listing.title || "");
  const [description, setDescription] = useState(listing.description || "");
  const [setName, setSetNameValue] = useState(listing.setName || "");
  const [cardId, setCardId] = useState(listing.cardId || "");
  const [rarity, setRarity] = useState(listing.rarity || "");
  const [price, setPrice] = useState(listing.price);
  const [pickUp, setPickUp] = useState(listing.pickUp || "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    listing.paymentMethod ?? { cash: false, paynow: false, bank: false }
  );
  const [submitting, setSubmitting] = useState(false);

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(
    listing.attachment?.front || null
  );
  const [backPreview, setBackPreview] = useState<string | null>(
    listing.attachment?.back || null
  );
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"front" | "back">("front");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canSubmit = cardName && title && price && Number(price) > 0 && (paymentMethod.cash || paymentMethod.paynow || paymentMethod.bank) && !submitting;

  const handleOpenUpload = (target: "front" | "back") => {
    setUploadTarget(target);
    setUploadDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (uploadTarget === "front") {
      if (frontPreview && !frontPreview.startsWith("http")) URL.revokeObjectURL(frontPreview);
      setFrontImage(file);
      setFrontPreview(previewUrl);
    } else {
      if (backPreview && !backPreview.startsWith("http")) URL.revokeObjectURL(backPreview);
      setBackImage(file);
      setBackPreview(previewUrl);
    }
    setUploadDialogOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (target: "front" | "back") => {
    if (target === "front") {
      if (frontPreview && !frontPreview.startsWith("http")) URL.revokeObjectURL(frontPreview);
      setFrontImage(null);
      setFrontPreview(null);
    } else {
      if (backPreview && !backPreview.startsWith("http")) URL.revokeObjectURL(backPreview);
      setBackImage(null);
      setBackPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const frontImageAction = frontImage ? "REPLACE" as const : "KEEP" as const;
      const backImageAction = backImage
        ? "REPLACE" as const
        : !backPreview && listing.attachment?.back
          ? "DELETE" as const
          : "KEEP" as const;

      await updateListing(listing.listingId, {
        cardName,
        title,
        description: description || undefined,
        setName: setName || undefined,
        cardId: cardId || undefined,
        rarity: rarity || undefined,
        price: Number(Number(price).toFixed(2)),
        pickup: pickUp || undefined,
        paymentMethod,
        frontImage: frontImage ?? undefined,
        backImage: backImage ?? undefined,
        frontImageAction,
        backImageAction,
      });
      toast.success("Listing updated successfully.");
      window.location.href = `/listing/${listing.listingId}?game=${encodeURIComponent(listing.gameName)}`;
    } catch {
      toast.error("Failed to update listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteListing(listing.listingId);
      toast.success("Listing deleted.");
      router.push("/listing");
    } catch {
      toast.error("Failed to delete listing.");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const listingUrl = `/listing/${listing.listingId}?game=${encodeURIComponent(listing.gameName)}`;

  return (
    <>
      <PageHeader title="Edit Listing" description="Update your listing details" />
      <form onSubmit={handleSubmit} className="animate-[fade-up_0.4s_ease-out_both]">
        {/* Image upload banner */}
        <div className="flex justify-center gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
          {frontPreview ? (
            <div className="w-48 sm:w-56 md:w-64 shrink-0 aspect-5/7 rounded-none bg-background overflow-hidden snap-start relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={frontPreview}
                alt="Card front"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded">Front</span>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" className="h-7 w-7 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-black shadow-sm transition-colors" onClick={() => handleOpenUpload("front")}>
                  <RefreshCwIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenUpload("front")}
              className="w-48 sm:w-56 md:w-64 shrink-0 aspect-5/7 rounded-none border border-dashed border-muted-foreground/40 flex flex-col items-center justify-center gap-1 hover:border-muted-foreground/60 transition-colors cursor-pointer snap-start"
            >
              <UploadIcon className="h-5 w-5 text-muted-foreground/70" />
              <span className="text-[11px] text-muted-foreground/70">Front</span>
            </button>
          )}

          {backPreview ? (
            <div className="w-48 sm:w-56 md:w-64 shrink-0 aspect-5/7 rounded-none bg-background overflow-hidden snap-start relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={backPreview}
                alt="Card back"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded">Back</span>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" className="h-7 w-7 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-black shadow-sm transition-colors" onClick={() => handleOpenUpload("back")}>
                  <RefreshCwIcon className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="h-7 w-7 flex items-center justify-center rounded-full bg-red-500/90 hover:bg-red-500 text-white shadow-sm transition-colors" onClick={() => handleRemoveImage("back")}>
                  <Trash2Icon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenUpload("back")}
              className="w-48 sm:w-56 md:w-64 shrink-0 aspect-5/7 rounded-none border border-dashed border-muted-foreground/40 flex flex-col items-center justify-center gap-1 hover:border-muted-foreground/60 transition-colors cursor-pointer snap-start"
            >
              <UploadIcon className="h-5 w-5 text-muted-foreground/70" />
              <span className="text-[11px] text-muted-foreground/70">Back</span>
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
              placeholder="E.G. CHARIZARD VMAX"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              maxLength={100}
              className="h-9"
            />
          </div>
          <div className="space-y-2 mt-3">
            <Label htmlFor="title">Listing Title *</Label>
            <Input
              id="title"
              placeholder="E.G. MINT CONDITION CHARIZARD VMAX"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              className="h-9"
            />
          </div>
          <div className="space-y-2 mt-3">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="DESCRIBE CONDITION, DETAILS, ETC."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
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
              placeholder="E.G. DARKNESS ABLAZE"
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
              placeholder="E.G. 020/189"
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
              placeholder="E.G. ULTRA RARE"
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
              placeholder="E.G. JURONG EAST MRT"
              value={pickUp}
              onChange={(e) => setPickUp(e.target.value)}
              maxLength={100}
              className="h-9"
            />
          </div>
        </div>

        <Separator />

        {/* Payment Method */}
        <div className="space-y-3 my-4">
          <Label>Payment Method *</Label>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={paymentMethod.cash}
                onCheckedChange={(v) => setPaymentMethod((p) => ({ ...p, cash: v === true }))}
              />
              Cash
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={paymentMethod.paynow}
                onCheckedChange={(v) => setPaymentMethod((p) => ({ ...p, paynow: v === true }))}
              />
              PayNow
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={paymentMethod.bank}
                onCheckedChange={(v) => setPaymentMethod((p) => ({ ...p, bank: v === true }))}
              />
              Bank Transfer
            </label>
          </div>
        </div>

        <Separator />

        {/* Submit */}
        <div className="flex gap-3 my-4">
          <Button type="submit" disabled={!canSubmit} className="flex-1 sm:flex-none">
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(listingUrl)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-md border border-dashed border-muted-foreground/40 hover:border-muted-foreground/60 transition-colors cursor-pointer"
            >
              <UploadIcon className="h-6 w-6 text-muted-foreground/70" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground/70">Click to select a file</p>
                <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG or WebP up to 5MB</p>
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
    </>
  );
}

function ImageCarousel({ attachment }: { attachment?: { front?: string; back?: string; images?: string[] } }) {
  const images = attachment?.images?.length
    ? attachment.images
    : ([attachment?.front, attachment?.back].filter(Boolean) as string[]);

  if (images.length === 0) {
    return (
      <ImagePlaceholder className="w-full aspect-5/7 rounded-none" />
    );
  }

  if (images.length === 1) {
    return (
      <div className="w-full aspect-5/7 rounded-none bg-background overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt="Card image" className="w-full h-full object-contain" />
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((src, i) => (
          <CarouselItem key={i}>
            <div className="w-full aspect-5/7 rounded-none bg-background overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Card image ${i + 1}`} className="w-full h-full object-contain" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}
