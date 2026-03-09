"use client";

import { useState } from "react";
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
import { ImageIcon, PlusIcon, XIcon } from "lucide-react";

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

  const initials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "?";

  const canSubmit = gameName && cardName && price && Number(price) > 0;

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
    });
    router.push("/marketplace");
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
                <div className="aspect-4/3 w-full bg-muted flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
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
    </div>
  );
}
