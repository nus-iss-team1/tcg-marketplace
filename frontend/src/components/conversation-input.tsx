"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConversationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function ConversationInput({ value, onChange, onSend }: ConversationInputProps) {
  return (
    <div className="flex items-center gap-2 border-t border-border pt-3">
      <Input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
        placeholder="Type your message..."
        className="flex-1 normal-case"
      />
      <Button size="default" onClick={onSend}>
        Send
      </Button>
    </div>
  );
}
