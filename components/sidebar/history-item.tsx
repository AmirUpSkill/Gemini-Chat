"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Trash2, Pencil, Check, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface HistoryItemProps {
  conversation: { _id: Id<"conversations">; title: string; model: string; _creationTime: number };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateTitle: (newTitle: string) => void;
}

export function HistoryItem({ conversation, isActive, onSelect, onDelete, onUpdateTitle }: HistoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const save = () => {
    if (editTitle.trim() && editTitle !== conversation.title) onUpdateTitle(editTitle.trim());
    setIsEditing(false);
  };

  const cancel = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  return (
    <div className={cn("group relative rounded-lg p-3 transition-colors cursor-pointer", isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50 border border-transparent")} onClick={() => !isEditing && onSelect()}>
      <div className="flex items-start gap-3">
        <MessageSquare className={cn("w-4 h-4 mt-0.5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }} className="h-8 text-sm" autoFocus />
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={save} className="h-6 px-2"><Check className="w-3 h-3" /></Button>
                <Button size="sm" variant="ghost" onClick={cancel} className="h-6 px-2"><X className="w-3 h-3" /></Button>
              </div>
            </div>
          ) : (
            <>
              <p className={cn("text-sm font-medium truncate", isActive ? "text-primary" : "text-foreground")}>{conversation.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{conversation.model}</p>
            </>
          )}
        </div>
        {!isEditing && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} className="h-7 w-7"><Pencil className="w-3 h-3" /></Button>
            <Button size="icon" variant="ghost" onClick={onDelete} className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
          </div>
        )}
      </div>
    </div>
  );
}
