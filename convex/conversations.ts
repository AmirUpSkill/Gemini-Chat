import { query } from "./_generated/server"
import { v } from "convex/values";

// --- Get All Conversations ---
export const get = query({
    // --- Define the argument --- 
    args: {
        search: v.optional(v.string()),
    },
    handler: async (ctx , args) => {
        // --- Search by title --- 
        if (args.search) { 
            return await ctx.db
                .query("conversations")
                .withSearchIndex("by_title", (q) => 
                    q.search("title", args.search as string)
                )
                .collect();
        }
         return await ctx.db.query("conversations").order("desc").collect();
    }
})