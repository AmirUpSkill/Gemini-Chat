"use client";

import { HistoryItem } from "./history-item";
import type { Id } from "@/convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryListProps {
  conversations: Array<{ _id: Id<"conversations">; title: string; model: string; _creationTime: number }>;
  currentConversationId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
  onDeleteConversation: (id: Id<"conversations">) => void;
  onUpdateTitle: (id: Id<"conversations">, newTitle: string) => void;
}

export function HistoryList({ conversations, currentConversationId, onSelectConversation, onDeleteConversation, onUpdateTitle }: HistoryListProps) {
  if (!conversations.length) return (
    <div className="flex-1 flex items-center justify-center text-center px-4">
      <p className="text-sm text-muted-foreground">No conversations yet.<br />Start a new chat to get started!</p>
    </div>
  );

  return (
    <ScrollArea className="flex-1 -mx-2 px-2">
      <div className="space-y-2">
        {conversations.map((c) => (
          <HistoryItem key={c._id} conversation={c} isActive={c._id === currentConversationId}
            onSelect={() => onSelectConversation(c._id)} onDelete={() => onDeleteConversation(c._id)}
            onUpdateTitle={(t) => onUpdateTitle(c._id, t)} />
        ))}
      </div>
    </ScrollArea>
  );
}
