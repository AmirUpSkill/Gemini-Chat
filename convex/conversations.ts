import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const ModelKeyValidator = v.union(v.literal("pro"), v.literal("flash"), v.literal("lite"));

function now() {
  return Date.now();
}

function normalizeTitle(input: string) {
  return input.toLowerCase().trim().replace(/\s+/g, " ");
}

// Upper bound for prefix searches
function upperBoundForPrefix(prefix: string) {
  return prefix + "\uffff";
}

export const createConversation = mutation({
  args: {
    title: v.optional(v.string()),
    model: v.optional(ModelKeyValidator),
  },
  handler: async (ctx, args) => {
    const title = args.title?.trim() || "New chat";
    const titleNormalized = normalizeTitle(title);
    const model = args.model ?? "flash";
    const ts = now();

    const conversationId = await ctx.db.insert("conversations", {
      title,
      titleNormalized,
      model,
      createdAt: ts,
      updatedAt: ts,
    });

    return { conversationId };
  },
});

export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const convo = await ctx.db.get(conversationId);
    return convo ?? null;
  },
});

export const listConversations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit }) => {
    const q = ctx.db
      .query("conversations")
      .withIndex("by_updatedAt")
      .order("desc");

    const out = limit ? await q.take(limit) : await q.collect();
    return out;
  },
});

export const searchConversations = query({
  args: {
    q: v.string(), // prefix search on normalized title
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { q, limit }) => {
    const prefix = normalizeTitle(q);
    if (!prefix) return [];

    const out = await ctx.db
      .query("conversations")
      .withIndex("by_titleNormalized", (iv) =>
        iv.gte("titleNormalized", prefix).lt("titleNormalized", upperBoundForPrefix(prefix))
      )
      .order("asc")
      .take(limit ?? 50);

    return out;
  },
});

export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    newTitle: v.string(),
  },
  handler: async (ctx, { conversationId, newTitle }) => {
    const convo = await ctx.db.get(conversationId);
    if (!convo) return null;

    const title = newTitle.trim() || convo.title;
    await ctx.db.patch(conversationId, {
      title,
      titleNormalized: normalizeTitle(title),
      updatedAt: now(),
    });

    return await ctx.db.get(conversationId);
  },
});

export const updateConversationModel = mutation({
  args: {
    conversationId: v.id("conversations"),
    model: ModelKeyValidator,
  },
  handler: async (ctx, { conversationId, model }) => {
    const convo = await ctx.db.get(conversationId);
    if (!convo) return null;

    await ctx.db.patch(conversationId, {
      model,
      updatedAt: now(),
    });

    return await ctx.db.get(conversationId);
  },
});

export const deleteConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    // Delete messages first
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
      .collect();

    for (const m of msgs) {
      await ctx.db.delete(m._id);
    }
    // Delete conversation
    await ctx.db.delete(conversationId);
    return { success: true };
  },
});
