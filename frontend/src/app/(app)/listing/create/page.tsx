"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ImageIcon, PlusIcon, UploadIcon, XIcon, Trash2Icon } from "lucide-react";

const GAMES = [
  "Pokemon TCG",
  "Yu-Gi-Oh!",
  "Magic: The Gathering",
  "Digimon Card Game",
  "One Piece Card Game",
  "Star Wars Unlimited",
];

export default function CreateListingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [gameName, setGameName] = useState("");
  const [cardName, setCardName] = useState("");
  const [setName, setSetName] = useState("");
  const [cardId, setCardId] = useState("");
  const [rarity, setRarity] = useState("");
  const [price, setPrice] = useState("");
  const [pickup, setPickup] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"front" | "back">("front");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "?";

  const canSubmit = gameName && cardName && price && Number(price) > 0;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call backend API to create listing
    console.log({
      gameName,
      cardName,
      setName: setName || undefined,
      cardId: cardId || undefined,
      rarity: rarity || undefined,
      price: Number(Number(price).toFixed(2)),
      pickup: pickup || undefined,
      frontImage,
      backImage,
    });
    router.push("/listing");
  };

  return (
    <div className="w-full max-w-352 mx-auto px-4 sm:px-0">
      <div className="mb-6 animate-[fade-up_0.4s_ease-out_both]">
        <p className="text-sm text-muted-foreground mb-1">
          Create a new listing
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Sell a Card
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
          {/* Live preview card */}
          <div className="w-full sm:w-44 md:w-48 shrink-0 animate-[fade-up_0.4s_ease-out_both]">
            <p className="text-xs text-muted-foreground mb-2">Preview</p>
            <Card className="gap-0 py-0 overflow-hidden">
              <CardHeader className="px-4 py-2.5 sm:px-3 sm:py-2.5 flex items-center">
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] sm:text-xs font-medium truncate">
                      {user?.givenName || user?.username}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                      @{user?.username}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-4/3 w-full bg-muted flex items-center justify-center overflow-hidden">
                  {frontPreview ? (
                    <Image
                      src={frontPreview}
                      alt="Card front"
                      width={192}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col justify-center items-start px-4 py-2.5 sm:px-3 sm:py-2.5 gap-0.5">
                <p className="text-xs sm:text-sm font-medium truncate w-full leading-tight">
                  {cardName || "Card Name"}
                </p>
                <p className="text-[11px] sm:text-xs font-semibold text-primary leading-tight">
                  ${price ? Number(price).toFixed(2) : "0.00"}
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">
                  {new Date().toLocaleDateString()}
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Form fields */}
          <div className="flex-1 min-w-0 space-y-5 animate-[fade-up_0.4s_ease-out_0.1s_both]">
            {/* Card Images */}
            <div className="space-y-2">
              <Label>Card Images</Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Front */}
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Front</p>
                  {frontPreview ? (
                    <div className="relative group">
                      <div className="aspect-4/3 rounded-md overflow-hidden border bg-muted">
                        <Image
                          src={frontPreview}
                          alt="Card front"
                          width={300}
                          height={225}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
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
                      className="aspect-4/3 w-full rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center gap-1.5 hover:border-muted-foreground/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <UploadIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload</span>
                    </button>
                  )}
                </div>

                {/* Back */}
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Back</p>
                  {backPreview ? (
                    <div className="relative group">
                      <div className="aspect-4/3 rounded-md overflow-hidden border bg-muted">
                        <Image
                          src={backPreview}
                          alt="Card back"
                          width={300}
                          height={225}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
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
                      className="aspect-4/3 w-full rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center gap-1.5 hover:border-muted-foreground/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <UploadIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Game & Card Name */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2 sm:w-48 sm:shrink-0">
                <Label htmlFor="gameName">Game *</Label>
                <Select value={gameName} onValueChange={setGameName}>
                  <SelectTrigger id="gameName" className="h-9">
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {GAMES.map((game) => (
                      <SelectItem key={game} value={game}>
                        {game}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1">
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

            {/* Set, Card ID, Rarity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="setName">Set Name</Label>
                <Input
                  id="setName"
                  placeholder="e.g. Darkness Ablaze"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
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
            </div>

            {/* Price & Pickup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <Input
                  id="pickup"
                  placeholder="e.g. Jurong East MRT"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  maxLength={100}
                  className="h-9"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={!canSubmit}>
                <PlusIcon className="mr-1.5 h-4 w-4" />
                Create Listing
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/listing")}
              >
                <XIcon className="mr-1.5 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
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
                <p className="text-sm font-medium">Click to select a file</p>
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
    </div>
  );
}
