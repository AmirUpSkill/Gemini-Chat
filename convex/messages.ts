import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Helpers
function now() {
  return Date.now();
}

function titleFromFirstMessage(text: string) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return "New chat";
  // Short and descriptive title from the first ~8 words
  const words = trimmed.split(" ").slice(0, 8).join(" ");
  const t = words.length > 60 ? words.slice(0, 60) + "…" : words;
  return t;
}

function normalizeTitle(input: string) {
  return input.toLowerCase().trim().replace(/\s+/g, " ");
}

// Models mapping (override via env if desired)
const GEMINI_PRO_MODEL = process.env.GEMINI_PRO_MODEL ?? "gemini-2.5-pro";
const GEMINI_FLASH_MODEL = process.env.GEMINI_FLASH_MODEL ?? "gemini-2.5-flash";
const GEMINI_LITE_MODEL = process.env.GEMINI_LITE_MODEL ?? "gemini-2.0-flash-lite";

function modelIdFromKey(key: "pro" | "flash" | "lite") {
  switch (key) {
    case "pro":
      return GEMINI_PRO_MODEL;
    case "flash":
      return GEMINI_FLASH_MODEL;
    case "lite":
      return GEMINI_LITE_MODEL;
  }
}

// Configure Google provider (AI SDK)
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

// QUERIES

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_createdAt", (q) => q.eq("conversationId", conversationId))
      .order("asc")
      .collect();
    return messages;
  },
});

// MUTATIONS

export const sendMessage = mutation({
  args: {
    conversationId: v.optional(v.id("conversations")),
    message: v.string(),
    model: v.optional(v.union(v.literal("pro"), v.literal("flash"), v.literal("lite"))),
  },
  handler: async (ctx, { conversationId, message, model }) => {
    const ts = now();
    let convoId: Id<"conversations">;

    if (!conversationId) {
      const title = titleFromFirstMessage(message);
      convoId = await ctx.db.insert("conversations", {
        title,
        titleNormalized: normalizeTitle(title),
        model: model ?? "flash",
        createdAt: ts,
        updatedAt: ts,
      });
    } else {
      convoId = conversationId;
      if (model) {
        await ctx.db.patch(convoId, { model, updatedAt: ts });
      } else {
        await ctx.db.patch(convoId, { updatedAt: ts });
      }
    }

    // Insert user's message
    const userMessageId = await ctx.db.insert("messages", {
      conversationId: convoId,
      role: "user",
      content: message,
      createdAt: ts,
    });

    // Insert placeholder assistant message
    const assistantMessageId = await ctx.db.insert("messages", {
      conversationId: convoId,
      role: "assistant",
      content: "",
      createdAt: now(),
    });

    return {
      conversationId: convoId,
      userMessageId,
      assistantMessageId,
    };
  },
});

// Generate AI response using Gemini
export const generateResponse = mutation({
  args: {
    conversationId: v.id("conversations"),
    assistantMessageId: v.id("messages"),
    modelKey: v.optional(v.union(v.literal("pro"), v.literal("flash"), v.literal("lite"))),
  },
  handler: async (ctx, args) => {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    }

    const { conversationId, assistantMessageId, modelKey } = args;

    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Build chat history
    const history = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_createdAt", (q) => q.eq("conversationId", conversationId))
      .order("asc")
      .collect();

    // Get prior messages (everything except the empty assistant message we just created)
    const prior = history.filter((m) => m._id !== assistantMessageId && m.content);

    // Choose model
    const modelName = modelIdFromKey(modelKey ?? conversation.model);

    try {
      // Use Vercel AI SDK streaming
      const result = await streamText({
        model: google(modelName),
        messages: prior.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      let finalText = "";

      for await (const chunk of result.textStream) {
        finalText += chunk;
      }

      // Update assistant message with generated content
      await ctx.db.patch(assistantMessageId, {
        content: finalText,
      });

      // Update conversation updatedAt
      await ctx.db.patch(conversationId, { updatedAt: Date.now() });

      return { success: true, content: finalText };
    } catch (error) {
      // On error, update message with error content
      const errorMsg = error instanceof Error ? error.message : "Failed to generate response";
      await ctx.db.patch(assistantMessageId, {
        content: `Error: ${errorMsg}`,
      });
      throw error;
    }
  },
});
