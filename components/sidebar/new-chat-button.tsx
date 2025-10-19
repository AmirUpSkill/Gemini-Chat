"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function NewChatButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="w-full mb-4 flex items-center justify-center gap-2 h-10 bg-primary hover:bg-primary/90 transition-shadow hover:shadow-lg" size="default">
      <Plus className="w-4 h-4" /><span className="font-medium">New Chat</span>
    </Button>
  );
}
