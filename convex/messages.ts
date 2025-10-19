import { query } from "./_generated/server";
import { v } from "convex/values";

// --- Get All Message for Specific Conversation ID  ---
export const get = query({
    // --- Define the Args --- 
    args: {
        conversationId: v.union(v.id("conversations"), v.string()),
    },
    // --- Fetch all Messages ---
    handler: async (ctx , args) => {
        // --- Handle Case Zero Messages --- 
        if (!args.conversationId || args.conversationId === "") {
            return [];
        }
        
        return await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => 
                q.eq("conversationId", args.conversationId as any)
            )
            .collect();
    }
})
