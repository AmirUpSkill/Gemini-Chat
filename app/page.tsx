"use client";

import { useState, useEffect, useRef } from "react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const MODELS = [
  { id: "gemini-pro", name: "Gemini Pro" },
  { id: "gemini-flash", name: "Gemini Flash" },
  { id: "gemini-lite", name: "Gemini Lite" },
];

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState("gemini-flash");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStart = (userText: string) => {
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, 
      { id: Date.now().toString(), role: "user", content: userText },
      { id: assistantId, role: "assistant", content: "" }
    ]);
    return assistantId;
  };

  const handleDelta = (id: string, delta: string) => 
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, content: m.content + delta } : m));

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {messages.length === 0 ? (
        <div className="min-h-screen flex flex-col justify-center items-center text-center space-y-12 px-4">
          <div className="space-y-3">
            <h1 className="text-6xl font-bold tracking-tight" style={{ color: "#454545" }}>
              Gemini Chat
            </h1>
            <p className="text-lg text-muted-foreground/80 font-light">Choose a model and start chatting</p>
          </div>
          <div className="w-full max-w-2xl">
            <ChatPanel {...{ selectedModel, models: MODELS, onModelChange: setSelectedModel, onStart: handleStart, onDelta: handleDelta }} />
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-2xl mx-auto px-4 pb-32">
            <div className="pt-8 pb-8">
              <div className="flex justify-end mb-6">
                <Button variant="outline" size="sm" onClick={() => setMessages([])} className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />New Chat
                </Button>
              </div>
              {messages.map((msg) => (
                <Message key={msg.id} from={msg.role}>
                  <MessageContent>{msg.content || "..."}</MessageContent>
                </Message>
              ))}
            </div>
            <div ref={bottomRef} />
          </div>
          <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto px-4 py-4 bg-background/95 backdrop-blur-sm">
            <ChatPanel {...{ selectedModel, models: MODELS, onModelChange: setSelectedModel, onStart: handleStart, onDelta: handleDelta }} />
          </div>
        </>
      )}
    </div>
  );
}
