"use client";

import { useState } from "react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { SparklesIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatPanel } from "@/components/chat/chat-panel";

const MODELS = [
  { id: "gemini-pro", name: "Gemini Pro" },
  { id: "gemini-flash", name: "Gemini Flash" },
  { id: "gemini-lite", name: "Gemini Lite" },
];

type Message = { id: string; role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState("gemini-flash");

  const handleStart = (userText: string) => {
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userText },
      { id: assistantId, role: "assistant", content: "" },
    ]);
    return assistantId;
  };

  const handleDelta = (assistantId: string, delta: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId ? { ...m, content: m.content + delta } : m
      )
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl space-y-4">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <SparklesIcon className="w-8 h-8" />
            Gemini Chat
          </h1>
        </div>

        {messages.length > 0 && (
          <div className="border rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto bg-card">
            {messages.map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>{msg.content}</MessageContent>
              </Message>
            ))}
          </div>
        )}

        <ChatPanel
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onStart={handleStart}
          onDelta={handleDelta}
          models={MODELS}
        />
      </div>
    </div>
  );
}
