import { defineSchema , defineTable} from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // --- Define the conversation table ---
    conversations: defineTable({
        title: v.string(),
        model: v.union(
            v.literal("Pro"),
            v.literal("Flash"),
            v.literal("Lite")
        )
    })
    .searchIndex("by_title",{
        searchField: "title",
    }),
    // --- Define the messages table --- 
    messages: defineTable({
        conversationId: v.id("conversations"),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
    })
    .index("by_conversation", ["conversationId"]),
})