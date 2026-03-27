"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UploadIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { ContentLayout } from "@/components/content-layout";
import { CardSearch } from "@/components/card-search";
import { LocationSearch } from "@/components/location-search";
import { getCardTypes, createListing } from "@/lib/listings";

export default function CreateListingPage() {
  const router = useRouter();
  const [games, setGames] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Sell a Card - VAULT OF CARDS";
    getCardTypes().then((types) => setGames(types.map((ct) => ct.value)));
  }, []);

  const [gameName, setGameName] = useState("");
  const [title, setTitle] = useState("");
  const [cardName, setCardName] = useState("");
  const [setName, setSetName] = useState("");
  const [cardId, setCardId] = useState("");
  const [rarity, setRarity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [pickUp, setPickUp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState({ cash: false, paynow: false, bank: false });
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"front" | "back">("front");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = gameName && cardName && title && price && Number(price) > 0 && frontImage && (paymentMethod.cash || paymentMethod.paynow || paymentMethod.bank) && !submitting;

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
      setFrontImage(file);
      setFrontPreview(previewUrl);
    } else {
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackImage(file);
      setBackPreview(previewUrl);
    }
    setUploadDialogOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (target: "front" | "back") => {
    if (target === "front") {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontImage(null);
      setFrontPreview(null);
    } else {
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackImage(null);
      setBackPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createListing({
        gameName,
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
      });
      toast.success("Listing created successfully.");
      router.push("/listing");
    } catch {
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ContentLayout>
      <PageHeader title="Sell a Card" description="Create a new listing" />
      <form onSubmit={handleSubmit} className="animate-[fade-up_0.4s_ease-out_both]">
        {/* Image upload banner */}
        <div className="flex justify-center gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
          {frontPreview ? (
            <div className="w-48 sm:w-56 md:w-64 shrink-0 aspect-5/7 rounded-none bg-muted overflow-hidden snap-start relative group">
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
              className="w-48 sm:w-56 md:w-64 shrink-0 aspect-5/7 rounded-none border border-dashed border-muted-foreground/40 flex flex-col items-center justify-center gap-1 hover:border-muted-foreground/60 transition-colors cursor-pointer snap-start"
            >
              <UploadIcon className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Front</span>
            </button>
          )}

          {backPreview ? (
            <div className="w-48 sm:w-56 md:w-64 shrink-0 aspect-5/7 rounded-none bg-muted overflow-hidden snap-start relative group">
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
              className="w-48 sm:w-56 md:w-64 shrink-0 aspect-5/7 rounded-none border border-dashed border-muted-foreground/40 flex flex-col items-center justify-center gap-1 hover:border-muted-foreground/60 transition-colors cursor-pointer snap-start"
            >
              <UploadIcon className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Back</span>
            </button>
          )}
        </div>

        {/* Card Details */}
        <div className="mt-4">
          <div className="space-y-2">
            <Label htmlFor="gameName">Game *</Label>
            <Select value={gameName} onValueChange={setGameName}>
              <SelectTrigger id="gameName" className="h-9">
                <SelectValue placeholder="SELECT A GAME" />
              </SelectTrigger>
              <SelectContent>
                {games.map((game) => (
                  <SelectItem key={game} value={game}>
                    {game}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 mt-3">
            <Label htmlFor="cardName">Card Name *</Label>
            <CardSearch
              gameName={gameName}
              value={cardName}
              onChange={setCardName}
              onSelect={(card) => {
                setCardName(card.cardName);
                if (card.setName) setSetName(card.setName);
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
            {submitting ? "Creating..." : "Create Listing"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/listing")}
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
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-md border border-dashed border-muted-foreground/40 hover:border-muted-foreground/60 transition-colors cursor-pointer"
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
    </ContentLayout>
  );
}
