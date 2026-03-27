"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
import { CardSearch } from "@/components/card-search";
import { LocationSearch } from "@/components/location-search";
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
import { ContentLayout } from "@/components/content-layout";

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
  const sellerId = listing.sellerId || "Unknown";

  return (
    <ContentLayout className="flex flex-1 flex-col w-full animate-[fade-up_0.4s_ease-out_both]">
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

          <h1 className="text-3xl sm:text-4xl font-heading">
            {listing.title || listing.cardName}
            {listing.listingStatus && (
              <Badge className="ml-4 align-middle text-sm" variant={listing.listingStatus === "ACTIVE" ? "default" : "secondary"}>
                {listing.listingStatus}
              </Badge>
            )}
          </h1>
          {listing.title && (
            <p className="text-sm text-muted-foreground mt-1">{listing.cardName}</p>
          )}

          <p className="text-lg sm:text-xl text-primary mt-2">
            ${Number(listing.price).toFixed(2)}
          </p>

          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Link href={`/seller/${listing.sellerId}`} className="underline hover:text-foreground transition-colors normal-case">
              @{sellerId}
            </Link>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {new Date(listing.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Card Details */}
          <div className="grid grid-cols-3 gap-2 mt-6">
            {listing.setName && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Set Name</p>
                <p className="text-sm">{listing.setName}</p>
              </div>
            )}
            {listing.cardId && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Card ID</p>
                <p className="text-sm">{listing.cardId}</p>
              </div>
            )}
            {listing.rarity && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Rarity</p>
                <p className="text-sm">{listing.rarity}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <div className="mt-6">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{listing.description}</p>
            </div>
          )}

          {/* Miscellaneous */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {listing.pickUp && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Pickup Location</p>
                <p className="text-sm">{listing.pickUp}</p>
              </div>
            )}
            {listing.paymentMethod && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Payment</p>
                <p className="text-sm">
                  {[
                    listing.paymentMethod.cash && "Cash",
                    listing.paymentMethod.paynow && "PayNow",
                    listing.paymentMethod.bank && "Bank Transfer",
                  ]
                    .filter(Boolean)
                    .join(", ") || "\u2014"}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </ContentLayout>
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

      await updateListing({
        gameName: listing.gameName,
        listingId: listing.listingId,
        body: {
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
        },
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
      await deleteListing({ gameName: listing.gameName, listingId: listing.listingId });
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
    <ContentLayout>
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
              <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
              <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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

        {/* Card Details */}
        <div className="mt-4">
          <div className="space-y-2">
            <Label>Game</Label>
            <div className="h-9 flex items-center px-3 rounded-md border bg-muted text-sm text-muted-foreground">{listing.gameName}</div>
          </div>
          <div className="space-y-2 mt-3">
            <Label htmlFor="cardName">Card Name *</Label>
            <CardSearch
              gameName={listing.gameName}
              value={cardName}
              onChange={setCardName}
              onSelect={(card) => {
                setCardName(card.cardName);
                if (card.setName) setSetNameValue(card.setName);
                if (card.cardId) setCardId(card.cardId);
                if (card.rarity) setRarity(card.rarity);
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="space-y-0.5">
              <Label>Set Name</Label>
              <p className="text-xs text-muted-foreground truncate">{setName || "\u2014"}</p>
            </div>
            <div className="space-y-0.5">
              <Label>Card ID</Label>
              <p className="text-xs text-muted-foreground truncate">{cardId || "\u2014"}</p>
            </div>
            <div className="space-y-0.5">
              <Label>Rarity</Label>
              <p className="text-xs text-muted-foreground truncate">{rarity || "\u2014"}</p>
            </div>
          </div>
        </div>

        {/* Listing Details */}
        <div className="mt-8">
          <div className="space-y-2">
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
            <Textarea
              id="description"
              placeholder="DESCRIBE CONDITION, DETAILS, ETC."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className="text-sm"
            />
          </div>
          <div className="space-y-2 mt-3 w-1/3 min-w-28">
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
        </div>

        {/* Miscellaneous */}
        <div className="mt-8">
          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup Location</Label>
            <LocationSearch value={pickUp} onChange={setPickUp} />
          </div>
          <div className="space-y-2 mt-3">
            <Label>Payment Method *</Label>
            <div className="flex flex-wrap gap-x-6 gap-y-2 h-9 items-center">
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
        </div>

        {/* Submit */}
        <div className="flex gap-3 mt-8 mb-4">
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
    </ContentLayout>
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
