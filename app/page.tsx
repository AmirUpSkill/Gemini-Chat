"use client";

import { useState, useEffect, useRef } from "react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useConversation } from "@/hooks/use-conversation";
import type { Id } from "@/convex/_generated/dataModel";

const MODELS = [{ id: "gemini-pro", name: "Gemini Pro" }, { id: "gemini-flash", name: "Gemini Flash" }, { id: "gemini-lite", name: "Gemini Lite" }];

export default function Home() {
  const conv = useConversation();
  const [model, setModel] = useState("gemini-flash");
  const [streaming, setStreaming] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const allMessages = [...conv.messages.map(m => ({ id: m._id, role: m.role, content: m.content })), ...streaming];

  useEffect(() => { if (allMessages.length) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [allMessages]);

  const handleStart = async (text: string) => {
    try {
      const convId = conv.currentConversationId || await conv.ensureConversation(model);
      await conv.sendMessage(text, convId);
      const assistantId = `streaming-${Date.now()}`;
      setStreaming([{ id: assistantId, role: "assistant", content: "" }]);
      return { assistantId, conversationId: convId };
    } catch (error) {
      console.error("Error:", error);
      return { assistantId: "", conversationId: null };
    }
  };

  const handleDelta = (id: string, delta: string) => setStreaming(prev => prev.map(m => m.id === id ? { ...m, content: m.content + delta } : m));

  const handleComplete = async (id: string, content: string, convId?: string) => {
    try {
      if (content.trim()) await conv.saveAssistantMessage(content, (convId || conv.currentConversationId) as any);
      setStreaming(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSelectConversation = (id: Id<"conversations">) => { setStreaming([]); conv.selectConversation(id); };
  const handleNewChat = () => { conv.reset(); setStreaming([]); };

  const chatProps = { selectedModel: model, models: MODELS, onModelChange: setModel, onStart: handleStart, onDelta: handleDelta, onStreamComplete: handleComplete };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar conversations={conv.conversations} currentConversationId={conv.currentConversationId} onSelectConversation={handleSelectConversation} onDeleteConversation={conv.deleteConversation} onUpdateTitle={conv.updateTitle} onNewChat={handleNewChat} />
      <div className="fixed top-4 right-4 z-10"><ThemeToggle /></div>
      {!allMessages.length ? (
        <div className="min-h-screen flex flex-col justify-center items-center text-center space-y-12 px-4">
          <div className="space-y-3">
            <h1 className="text-6xl font-bold tracking-tight" style={{ color: "#454545" }}>Gemini Chat</h1>
            <p className="text-lg text-muted-foreground/80 font-light">Choose a model and start chatting</p>
          </div>
          <div className="w-full max-w-2xl"><ChatPanel {...chatProps} /></div>
        </div>
      ) : (
        <>
          <div className="max-w-2xl mx-auto px-4 pb-32">
            <div className="pt-8 pb-8">
              {allMessages.map(msg => (<Message key={msg.id} from={msg.role}><MessageContent>{msg.content || "..."}</MessageContent></Message>))}
            </div>
            <div ref={bottomRef} />
          </div>
          <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto px-4 py-4 bg-background/95 backdrop-blur-sm"><ChatPanel {...chatProps} /></div>
        </>
      )}
    </div>
  );
}
