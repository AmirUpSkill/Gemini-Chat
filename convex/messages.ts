import { v } from "convex/values";
import { mutation, query, components } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { httpAction } from "convex/server";

import {
  PersistentTextStreaming,
  StreamId,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming/convex";

import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const pts = new PersistentTextStreaming(components.persistentTextStreaming);

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

// Provide the stream body for a given streamId to all subscribers
export const getStreamBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, { streamId }) => {
    return await pts.getStreamBody(ctx, streamId as StreamId);
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
      // If model override was provided, keep the conversation's model in sync
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

    // Create a stream for the assistant's response and an "assistant streaming" message
    const streamId = await pts.createStream(ctx);
    const assistantMessageId = await ctx.db.insert("messages", {
      conversationId: convoId,
      role: "assistant",
      content: "",
      status: "streaming",
      streamId: streamId as string,
      createdAt: now(),
    });

    // Return all metadata needed by the client to start streaming
    return {
      conversationId: convoId,
      userMessageId,
      assistantMessageId,
      streamId,
    };
  },
});

// HTTP ACTION FOR STREAMING

// Body expected from client when starting the stream:
type StreamBody = {
  streamId: string;
  conversationId: Id<"conversations">;
  assistantMessageId: Id<"messages">;
  // Optional: allows client to force model selection per message
  modelKey?: "pro" | "flash" | "lite";
};

// Streams the assistant response into the persistent stream and finalizes the message
export const streamChat = httpAction(async (ctx, request) => {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response("Missing GOOGLE_GENERATIVE_AI_API_KEY", { status: 500 });
  }

  let body: StreamBody;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { streamId, conversationId, assistantMessageId, modelKey } = body;
  if (!streamId || !conversationId || !assistantMessageId) {
    return new Response("Missing required fields", { status: 400 });
  }

  const conversation = await ctx.db.get(conversationId);
  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  // Build chat history excluding the streaming assistant message itself
  const history = await ctx.db
    .query("messages")
    .withIndex("by_conversationId_createdAt", (q) => q.eq("conversationId", conversationId))
    .order("asc")
    .collect();

  const prior = history.filter((m) => m._id !== assistantMessageId);

  // Choose model
  const modelName = modelIdFromKey(modelKey ?? conversation.model);

  // Start streaming with PersistentTextStreaming
  const generateChat = async (
    _ctx: Parameters<typeof pts.stream>[0],
    _request: Request,
    _streamId: StreamId,
    chunkAppender: (chunk: string) => Promise<void>
  ) => {
    // Use Vercel AI SDK streaming
    const result = await streamText({
      model: google(modelName),
      messages: prior.map((m) => ({
        role: m.role, // "user" | "assistant"
        content: m.content,
      })),
    });

    let finalText = "";

    for await (const chunk of result.textStream) {
      finalText += chunk;
      await chunkAppender(chunk);
    }

    // Finalize assistant message content in the DB
    await ctx.db.patch(assistantMessageId, {
      content: finalText,
      status: "final",
    });

    // Also update conversation updatedAt
    await ctx.db.patch(conversationId, { updatedAt: Date.now() });
  };

  const response = await pts.stream(ctx, request, streamId as StreamId, generateChat);

  // CORS (POC)
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Vary", "Origin");

  return response;
});
