"use client";

import { useState, useEffect, useRef } from "react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useConversation } from "@/hooks/use-conversation";

const MODELS = [
  { id: "gemini-pro", name: "Gemini Pro" },
  { id: "gemini-flash", name: "Gemini Flash" },
  { id: "gemini-lite", name: "Gemini Lite" },
];

type StreamingMsg = { id: string; role: "user" | "assistant"; content: string };

export default function Home() {
  const conv = useConversation();
  const [model, setModel] = useState("gemini-flash");
  const [streaming, setStreaming] = useState<StreamingMsg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const allMessages = [...conv.messages.map(m => ({ id: m._id, role: m.role, content: m.content })), ...streaming];

  useEffect(() => {
    if (allMessages.length) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

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

  const handleDelta = (id: string, delta: string) => {
    setStreaming(prev => prev.map(m => m.id === id ? { ...m, content: m.content + delta } : m));
  };

  const handleComplete = async (id: string, content: string, convId?: string) => {
    try {
      if (content.trim()) await conv.saveAssistantMessage(content, (convId || conv.currentConversationId) as any);
      setStreaming(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-10"><ThemeToggle /></div>

      {!allMessages.length ? (
        <div className="min-h-screen flex flex-col justify-center items-center text-center space-y-12 px-4">
          <div className="space-y-3">
            <h1 className="text-6xl font-bold tracking-tight" style={{ color: "#454545" }}>Gemini Chat</h1>
            <p className="text-lg text-muted-foreground/80 font-light">Choose a model and start chatting</p>
          </div>
          <div className="w-full max-w-2xl">
            <ChatPanel selectedModel={model} models={MODELS} onModelChange={setModel} 
              onStart={handleStart} onDelta={handleDelta} onStreamComplete={handleComplete} />
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-2xl mx-auto px-4 pb-32">
            <div className="pt-8 pb-8">
              <div className="flex justify-end mb-6">
                <Button variant="outline" size="sm" onClick={conv.reset} className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />New Chat
                </Button>
              </div>
              {allMessages.map(msg => (
                <Message key={msg.id} from={msg.role}>
                  <MessageContent>{msg.content || "..."}</MessageContent>
                </Message>
              ))}
            </div>
            <div ref={bottomRef} />
          </div>
          <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto px-4 py-4 bg-background/95 backdrop-blur-sm">
            <ChatPanel selectedModel={model} models={MODELS} onModelChange={setModel} 
              onStart={handleStart} onDelta={handleDelta} onStreamComplete={handleComplete} />
          </div>
        </>
      )}
    </div>
  );
}
