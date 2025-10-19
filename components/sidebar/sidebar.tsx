"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { NewChatButton } from "./new-chat-button";
import { SearchBar } from "./search-bar";
import { HistoryList } from "./history-list";
import type { Id } from "@/convex/_generated/dataModel";

interface SidebarProps {
  conversations: Array<{ _id: Id<"conversations">; title: string; model: string; _creationTime: number }>;
  currentConversationId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
  onDeleteConversation: (id: Id<"conversations">) => void;
  onUpdateTitle: (id: Id<"conversations">, newTitle: string) => void;
  onNewChat: () => void;
}

export function Sidebar({ conversations, currentConversationId, onSelectConversation, onDeleteConversation, onUpdateTitle, onNewChat }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const close = () => setIsOpen(false);
  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="shadow-md">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={close} />}
      <div className={`fixed top-0 left-0 h-full w-80 bg-background border-r shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-4 pt-20">
          <NewChatButton onClick={() => { onNewChat(); close(); }} />
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <HistoryList conversations={filtered} currentConversationId={currentConversationId} 
            onSelectConversation={(id) => { onSelectConversation(id); close(); }} 
            onDeleteConversation={onDeleteConversation} onUpdateTitle={onUpdateTitle} />
        </div>
      </div>
    </>
  );
}
