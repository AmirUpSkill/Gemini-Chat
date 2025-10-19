"use client";

import { useState } from "react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { MessageInput } from "./message-input";
import { ModelSelector } from "./model-selector";

interface ChatPanelProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onStart: (userText: string) => string;
  onDelta: (assistantId: string, delta: string) => void;
  models: Array<{ id: string; name: string }>;
}

export function ChatPanel({ selectedModel, onModelChange, onStart, onDelta, models }: ChatPanelProps) {
  const [isStreaming, setIsStreaming] = useState(false);

  const handleStreamingSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    setIsStreaming(true);
    const assistantId = onStart(message.text.trim());

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: message.text.trim() }], model: selectedModel }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) onDelta(assistantId, chunk);
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <MessageInput onSubmit={handleStreamingSubmit} isStreaming={isStreaming}>
      <ModelSelector {...{ selectedModel, onModelChange, models }} />
    </MessageInput>
  );
}
