"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";
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
  onSubmit: (message: PromptInputMessage) => void;
  models: Array<{ id: string; name: string }>;
}

export function ChatPanel({
  selectedModel,
  onModelChange,
  onSubmit,
  models,
}: ChatPanelProps) {
  const { theme } = useTheme();

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

  return (
    <PromptInput onSubmit={onSubmit} className="rounded-lg shadow-sm" multiple>
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
