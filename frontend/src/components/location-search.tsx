"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationResult {
  place_id: number;
  display_name: string;
  name: string;
}

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

// Parse stored value: "address (description)" → { address, description }
function parseValue(value: string): { address: string; description: string } {
  const match = value.match(/^(.+?)\s*\((.+)\)$/);
  if (match) return { address: match[1], description: match[2] };
  return { address: value, description: "" };
}

// Combine back: address + description → "address (description)"
function combineValue(address: string, description: string): string {
  const trimmed = description.trim();
  return trimmed ? `${address.trim()} (${trimmed})` : address.trim();
}

async function searchLocation(query: string): Promise<LocationResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "5",
    countrycodes: "sg",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { "User-Agent": "VaultOfCards/1.0" },
  });
  if (!res.ok) return [];
  return res.json();
}

export function LocationSearch({ value, onChange }: LocationSearchProps) {
  const parsed = parseValue(value);
  const [address, setAddress] = useState(parsed.address);
  const [description, setDescription] = useState(parsed.description);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback((query: string) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchLocation(query)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(address), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [address, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddressChange = (val: string) => {
    setAddress(val);
    setOpen(true);
    onChange(combineValue(val, description));
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    onChange(combineValue(address, val));
  };

  const handleSelect = (loc: LocationResult) => {
    const parts = loc.display_name.split(", ");
    const postalCode = parts.find((p) => /^\d{5,6}$/.test(p));
    const name = parts.slice(0, 3).join(", ");
    const selected = postalCode ? `${name}, ${postalCode}` : name;
    setAddress(selected);
    setOpen(false);
    onChange(combineValue(selected, description));
  };

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="relative w-full">
        <Input
          placeholder="E.G. JURONG EAST MRT"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          onFocus={() => address.length >= 3 && setOpen(true)}
          maxLength={100}
          className="h-9"
        />
        {open && address.length >= 3 && (results.length > 0 || loading) && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-50 overflow-y-auto rounded-md border bg-background p-1 shadow-md">
            {loading ? (
              <p className="py-3 text-center text-xs text-muted-foreground">Searching...</p>
            ) : (
              results.map((loc) => (
                <button
                  key={loc.place_id}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-2 py-1.5 rounded-sm hover:text-muted-foreground transition-colors"
                >
                  <span className="text-sm">{loc.name}</span>
                  <br />
                  <span className="text-xs text-muted-foreground truncate block">
                    {loc.display_name.replace(/, Singapore$/i, "").replace(/, Singapore,/i, ",")}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <Label>Meetup Details</Label>
      <Input
        placeholder="E.G. EXIT A, NEAR 7-ELEVEN"
        value={description}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        maxLength={100}
        className="h-9"
      />
    </div>
  );
}
