"use client";

import { useTheme } from "next-themes";
import { useMemo, useState } from "react";
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
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";

interface ChatPanelProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onStart: (userText: string) => string; 
  onDelta: (assistantId: string, delta: string) => void;
  onError?: (error: string) => void;
  models: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export function ChatPanel({
  selectedModel,
  onModelChange,
  onStart,
  onDelta,
  onError,
  models,
  isLoading = false,
}: ChatPanelProps) {
  const { theme } = useTheme();
  const [isStreaming, setIsStreaming] = useState(false);

  // Calculate theme-aware styles
  const themeStyles = useMemo(() => {
    const isDark = theme === "dark";
    return {
      backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa",
      borderColor: isDark ? "#333333" : "#e9ecef",
      submitBgColor: isDark ? "#2d2d2d" : "#f8f9fa",
      submitTextColor: isDark ? "#e5e7eb" : "#495057",
      submitHoverBgColor: isDark ? "#3d3d3d" : "#f1f3f5",
      submitHoverTextColor: isDark ? "#f3f4f6" : "#212529",
    };
  }, [theme]);

  // --- Handle streaming from Gemini API ---
  const handleStreamingSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;

    setIsStreaming(true);
    const userText = message.text.trim();

    // Let parent add user+assistant placeholder; get assistant id back
    const assistantId = onStart(userText);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: userText,
            },
          ],
          model: selectedModel,
        }),
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
      } else {
        // Fallback if stream not supported
        const text = await response.text();
        if (text) onDelta(assistantId, text);
      }
    } catch (err: any) {
      console.error("Streaming error:", err);
      onError?.(err?.message ?? "Failed to get response from Gemini");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <PromptInput onSubmit={handleStreamingSubmit} className="rounded-lg shadow-sm" multiple>
      <PromptInputAttachments>
        {(attachment) => <PromptInputAttachment key={attachment.id} data={attachment} />}
      </PromptInputAttachments>

      <PromptInputBody>
        <PromptInputTextarea 
          placeholder="Ask Gemini something..." 
          disabled={isStreaming || isLoading}
        />
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
          <PromptInputModelSelect value={selectedModel} onValueChange={onModelChange}>
            <PromptInputModelSelectTrigger>
              <PromptInputModelSelectValue />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              {models.map((model) => (
                <PromptInputModelSelectItem key={model.id} value={model.id}>
                  {model.name}
                </PromptInputModelSelectItem>
              ))}
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>

          <PromptInputSubmit
            className="transition-colors"
            style={{
              backgroundColor: themeStyles.submitBgColor,
              color: themeStyles.submitTextColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeStyles.submitHoverBgColor;
              e.currentTarget.style.color = themeStyles.submitHoverTextColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = themeStyles.submitBgColor;
              e.currentTarget.style.color = themeStyles.submitTextColor;
            }}
          />
        </div>
      </PromptInputFooter>

      <style jsx>{`
        :global([data-chat-panel]) {
          background-color: ${themeStyles.backgroundColor};
          border-color: ${themeStyles.borderColor};
        }
      `}</style>
    </PromptInput>
  );
}
