import { mutation } from "./_generated/server";
import { v } from "convex/values";

// --- Method to Create A New Conversation ---
export const createConversation = mutation({
  args: {
    title: v.optional(v.string()),
    model: v.union(
      v.literal("Pro"),
      v.literal("Flash"),
      v.literal("Lite")
    ),
  },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("conversations", {
      title: args.title?.trim() || "New Conversation",
      model: args.model,
    });

    return conversationId;
  },
});

// --- A Method to Save User Message ---
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // --- Validate content isn't empty ---
    if (!args.content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    // --- Verify conversation exists ---
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: "user",
      content: args.content.trim(),
    });

    return { messageId, conversationId: args.conversationId };
  },
});

// --- Save the Message After Streaming ---
export const saveAssistantMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.content.trim()) {
      throw new Error("Cannot save empty response");
    }

    // --- Verify conversation exists ---
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: "assistant",
      content: args.content.trim(),
    });

    return messageId;
  },
});

// --- Update the Message Title ---
export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.newTitle.trim()) {
      throw new Error("Title cannot be empty");
    }

    // --- Verify conversation exists ---
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // --- Update the title ---
    await ctx.db.patch(args.conversationId, {
      title: args.newTitle.trim(),
    });

    // --- Return updated conversation ---
    return await ctx.db.get(args.conversationId);
  },
});

// --- Delete Complete Conversation --- 
export const deleteConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // --- Verify conversation exists ---
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // --- Get all messages for this conversation ---
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // --- Delete all messages ---
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    // --- Delete conversation ---
    await ctx.db.delete(args.conversationId);

    return { success: true, deletedMessages: messages.length };
  },
});
