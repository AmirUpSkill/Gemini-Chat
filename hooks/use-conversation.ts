"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useConversation(initialId: Id<"conversations"> | null = null) {
  // --- Eeach Chat Session need to start  Conversion Session for this we need to Check Conversation Session ---
  const [currentConversationId, setCurrentConversationId] = useState<Id<"conversations"> | null>(initialId);
  // --- Here We Fetch Messages for Current Conversation Session ---
  const messages = useQuery(api.messages.get, currentConversationId ? { conversationId: currentConversationId } : "skip");
  const conversations = useQuery(api.conversations.get, {});
  // --- Here Are the Mutation Operation Like , create Conversation ----
  const createConv = useMutation(api.mutations.createConversation);
  // --- Send Message ---
  const sendMsg = useMutation(api.mutations.sendMessage);
  // --- Save Message ---
  const saveAssistantMsg = useMutation(api.mutations.saveAssistantMessage);
  // --- Delete Conv ---
  const deleteConv = useMutation(api.mutations.deleteConversation);
  // --- Update Title --- 
  const updateTitle = useMutation(api.mutations.updateConversationTitle);

  const ensureConversation = async (model: string, title = "New Chat") => {
    const id = await createConv({ model: model as any, title });
    setCurrentConversationId(id);
    return id;
  };

  const sendMessage = async (content: string, convId?: Id<"conversations">) => {
    const id = convId || currentConversationId;
    if (!id) throw new Error("No active conversation");
    return sendMsg({ conversationId: id, content });
  };

  const saveAssistantMessage = async (content: string, convId?: Id<"conversations">) => {
    const id = convId || currentConversationId;
    if (!id) throw new Error("No active conversation");
    return saveAssistantMsg({ conversationId: id, content });
  };

  return {
    currentConversationId,
    messages: messages || [],
    conversations: conversations || [],
    ensureConversation,
    sendMessage,
    saveAssistantMessage,
    deleteConversation: async (id: Id<"conversations">) => {
      await deleteConv({ conversationId: id });
      if (currentConversationId === id) setCurrentConversationId(null);
    },
    updateTitle: (id: Id<"conversations">, newTitle: string) => updateTitle({ conversationId: id, newTitle }),
    selectConversation: (id: Id<"conversations">) => setCurrentConversationId(id),
    reset: () => setCurrentConversationId(null),
  };
}
