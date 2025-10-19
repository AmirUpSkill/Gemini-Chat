"use client";

import { useState } from "react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { MessageInput } from "./message-input";
import { ModelSelector } from "./model-selector";

interface Props {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onStart: (text: string) => Promise<{ assistantId: string; conversationId: string | null }>;
  onDelta: (id: string, delta: string) => void;
  onStreamComplete: (id: string, content: string, convId?: string) => Promise<void>;
  models: Array<{ id: string; name: string }>;
}

export function ChatPanel({ selectedModel, onModelChange, onStart, onDelta, onStreamComplete, models }: Props) {
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = async (msg: PromptInputMessage) => {
    const text = msg.text?.trim();
    if (!text) return;
    
    setIsStreaming(true);
    try {
      const { assistantId, conversationId } = await onStart(text);
      if (!assistantId) return;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text }], model: selectedModel }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let content = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            content += chunk;
            onDelta(assistantId, chunk);
          }
        }
      }

      await onStreamComplete(assistantId, content, conversationId || undefined);
    } catch (err) {
      console.error("Streaming error:", err);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <MessageInput onSubmit={handleSubmit} isStreaming={isStreaming}>
      <ModelSelector {...{ selectedModel, onModelChange, models }} />
    </MessageInput>
  );
}
