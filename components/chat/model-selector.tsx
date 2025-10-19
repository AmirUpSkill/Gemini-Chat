"use client";

import { PromptInputModelSelect, PromptInputModelSelectTrigger, PromptInputModelSelectContent, PromptInputModelSelectItem, PromptInputModelSelectValue } from "@/components/ai-elements/prompt-input";

interface ModelSelectorProps { selectedModel: string; onModelChange: (model: string) => void; models: Array<{ id: string; name: string }>; }

export function ModelSelector({ selectedModel, onModelChange, models }: ModelSelectorProps) {
  return (
    <PromptInputModelSelect value={selectedModel} onValueChange={onModelChange}>
      <PromptInputModelSelectTrigger><PromptInputModelSelectValue /></PromptInputModelSelectTrigger>
      <PromptInputModelSelectContent>
        {models.map((m) => <PromptInputModelSelectItem key={m.id} value={m.id}>{m.name}</PromptInputModelSelectItem>)}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}
