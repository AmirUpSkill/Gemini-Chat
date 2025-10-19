import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const ModelKey = v.union(
  v.literal("pro"),
  v.literal("flash"),
  v.literal("lite")
);

export default defineSchema({
  conversations: defineTable({
    title: v.string(),
    titleNormalized: v.string(),
    model: ModelKey, // "pro" | "flash" | "lite"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_titleNormalized", ["titleNormalized"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(), // final content (assistant may be empty while streaming)
    createdAt: v.number(),
    // Streaming metadata:
    status: v.optional(v.union(v.literal("final"), v.literal("streaming"), v.literal("aborted"))),
    streamId: v.optional(v.string()), // PersistentTextStreaming StreamId as string
  })
    .index("by_conversationId_createdAt", ["conversationId", "createdAt"])
    .index("by_conversationId", ["conversationId"]),
});
