"use client";

import { useState } from "react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTools,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
} from "@/components/ai-elements/prompt-input";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { SparklesIcon } from "lucide-react";

const MODELS = [
  { id: "gemini-pro", name: "Gemini Pro" },
  { id: "gemini-flash", name: "Gemini Flash" },
  { id: "gemini-lite", name: "Gemini Lite" },
];

export default function Home() {
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([]);
  const [selectedModel, setSelectedModel] = useState("gemini-flash");

  const handleSubmit = (message: { text?: string }) => {
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

        {/* Prompt Input */}
        <PromptInput onSubmit={handleSubmit} className="rounded-lg shadow-sm" style={{ backgroundColor: "#f8f9fa" }} multiple>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment key={attachment.id} data={attachment} />}
          </PromptInputAttachments>

          <PromptInputBody>
            <PromptInputTextarea placeholder="Ask Gemini something..." />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>

            <div className="flex items-center gap-2">
              <PromptInputModelSelect value={selectedModel} onValueChange={setSelectedModel}>
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {MODELS.map((model) => (
                    <PromptInputModelSelectItem key={model.id} value={model.id}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>

              <PromptInputSubmit className="bg-[#f8f9fa] text-[#495057] hover:bg-[#f8f9fa] hover:text-[#495057]" />
            </div>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}