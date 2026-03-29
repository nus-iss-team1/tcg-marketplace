"use client";

import { Button } from "@/components/ui/button";

interface ConversationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function ConversationInput({ value, onChange, onSend }: ConversationInputProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4">
      <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Write a message</label>
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Button type="button" variant="default" onClick={onSend} className="whitespace-nowrap">
          Send
        </Button>
      </div>
    </div>
  );
}
