"use client";

import { useState } from "react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { SparklesIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatPanel } from "@/components/chat/chat-panel";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

const MODELS = [
  { id: "gemini-pro", name: "Gemini Pro" },
  { id: "gemini-flash", name: "Gemini Flash" },
  { id: "gemini-lite", name: "Gemini Lite" },
];

export default function Home() {
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([]);
  const [selectedModel, setSelectedModel] = useState("gemini-flash");

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;

    const messageText = message.text.trim();
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: messageText },
    ]);

    setTimeout(() => {
      const model = MODELS.find((m) => m.id === selectedModel)?.name || "Gemini";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: `Using ${model}: ${messageText}` },
      ]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl space-y-4">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <SparklesIcon className="w-8 h-8" />
            Gemini Chat
          </h1>
          <p className="text-muted-foreground">Choose a model and start chatting</p>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="border rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto bg-card mb-4">
            {messages.map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>
                  {msg.content}
                </MessageContent>
              </Message>
            ))}
          </div>
        )}

        {/* Chat Panel */}
        <ChatPanel
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onSubmit={handleSubmit}
          models={MODELS}
        />
      </div>
    </div>
  );
}