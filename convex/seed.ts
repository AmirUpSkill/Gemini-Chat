import { mutation } from "./_generated/server";
import { v } from "convex/values";

// --- Seed the database with dummy data ---
export const seedDatabase = mutation(async (ctx) => {
  // --- Sample conversations data ---
  const conversationsData = [
    {
      title: "Introduction to Gemini API",
      model: "Pro" as const,
    },
    {
      title: "Building AI Applications with Next.js",
      model: "Flash" as const,
    },
  ];

  // --- Create conversations and collect their IDs ---
  const conversationIds = [];
  for (const conv of conversationsData) {
    const convId = await ctx.db.insert("conversations", {
      title: conv.title,
      model: conv.model,
    });
    conversationIds.push(convId);
  }

  // --- Sample messages for first conversation (Pro) ---
  const messagesConv1 = [
    {
      conversationId: conversationIds[0],
      role: "user" as const,
      content: "What is the Gemini API?",
    },
    {
      conversationId: conversationIds[0],
      role: "assistant" as const,
      content:
        "Gemini is Google's most capable AI model family. It comes in three sizes: Pro, Flash, and Lite. Each is optimized for different use cases and performance requirements.",
    },
    {
      conversationId: conversationIds[0],
      role: "user" as const,
      content: "What are the differences between the models?",
    },
    {
      conversationId: conversationIds[0],
      role: "assistant" as const,
      content:
        "Pro is the most capable, Flash is fast and efficient, and Lite is ultra-lightweight. Choose based on your latency and quality requirements.",
    },
    {
      conversationId: conversationIds[0],
      role: "user" as const,
      content: "How do I get started?",
    },
    {
      conversationId: conversationIds[0],
      role: "assistant" as const,
      content:
        "Visit Google AI Studio, create an API key, and start making requests. The documentation has great examples to help you get started quickly.",
    },
  ];

  // --- Sample messages for second conversation (Flash) ---
  const messagesConv2 = [
    {
      conversationId: conversationIds[1],
      role: "user" as const,
      content: "How do I integrate Gemini with Next.js?",
    },
    {
      conversationId: conversationIds[1],
      role: "assistant" as const,
      content:
        "Use the Vercel AI SDK v5, which provides seamless integration with Next.js. It handles streaming, type safety, and real-time updates.",
    },
    {
      conversationId: conversationIds[1],
      role: "user" as const,
      content: "Can you show me an example?",
    },
    {
      conversationId: conversationIds[1],
      role: "assistant" as const,
      content:
        "Sure! Use the `generateText` function for one-shot requests or `streamText` for streaming responses. Both work great with server components.",
    },
    {
      conversationId: conversationIds[1],
      role: "user" as const,
      content: "What about error handling?",
    },
    {
      conversationId: conversationIds[1],
      role: "assistant" as const,
      content:
        "The SDK provides built-in error handling. Always wrap calls in try-catch and handle network errors gracefully.",
    },
  ];

  // --- Insert all messages ---
  for (const msg of [...messagesConv1, ...messagesConv2]) {
    await ctx.db.insert("messages", msg);
  }

  return {
    success: true,
    message: `Seeded database with ${conversationIds.length} conversations and ${messagesConv1.length + messagesConv2.length} messages`,
  };
});