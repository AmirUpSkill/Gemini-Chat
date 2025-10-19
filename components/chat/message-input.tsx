"use client";

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
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";

interface MessageInputProps {
  onSubmit: (message: PromptInputMessage) => void;
  isStreaming: boolean;
  children: React.ReactNode;
}

export function MessageInput({ onSubmit, isStreaming, children }: MessageInputProps) {
  return (
    <PromptInput onSubmit={onSubmit} className="rounded-lg shadow-sm" multiple>
      <PromptInputAttachments>
        {(attachment) => <PromptInputAttachment key={attachment.id} data={attachment} />}
      </PromptInputAttachments>

      <PromptInputBody>
        <PromptInputTextarea placeholder="Ask Gemini something..." disabled={isStreaming} />
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
          {children}
          <PromptInputSubmit className="transition-colors" style={{ backgroundColor: "#1a1a1a", color: "#e5e5e5" }} />
        </div>
      </PromptInputFooter>
    </PromptInput>
  );
}
