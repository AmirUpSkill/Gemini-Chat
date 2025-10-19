# Gemini Chat Backend Testing Guide

## Step 1: Start Convex Development Server

Run the Convex development server in one terminal:

```bash
pnpm convex dev
```

You should see output like:
```
✓ 16:25:00 Convex functions ready! 
✓ Bundle ready (0.20s)
✓ Watching for changes...
```

If there are errors, check that:
- All `.env.local` variables are set correctly
- No TypeScript errors in `convex/` folder
- Convex schema compiles successfully

## Step 2: Start Next.js Development Server

In another terminal, run:

```bash
pnpm dev
```

You should see the Next.js app running at `http://localhost:3000`.

## Step 3: Test via Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select your project "gemini-chat"
3. Navigate to the "Functions" tab
4. You should see your Convex functions:
   - `conversations:createConversation`
   - `conversations:listConversations`
   - `conversations:searchConversations`
   - `conversations:getConversation`
   - `conversations:updateConversationTitle`
   - `conversations:updateConversationModel`
   - `conversations:deleteConversation`
   - `messages:getMessages`
   - `messages:sendMessage`
   - `messages:generateResponse`

## Step 4: Test Creating a Conversation (Using Convex Dashboard)

1. Click on `conversations:createConversation`
2. In the args editor, enter:
```json
{
  "title": "Test Chat",
  "model": "flash"
}
```
3. Click "Call Function"
4. You should get back something like:
```json
{
  "conversationId": "..."
}
```

## Step 5: Test Sending a Message

1. Click on `messages:sendMessage`
2. First, get a valid `conversationId` from Step 4
3. In the args editor, enter:
```json
{
  "conversationId": "k1234567890abcdefgh",
  "message": "Hello! What's the capital of France?",
  "model": "flash"
}
```
4. Click "Call Function"
5. You should get back:
```json
{
  "conversationId": "...",
  "userMessageId": "...",
  "assistantMessageId": "..."
}
```

## Step 6: Test Generating AI Response

1. Click on `messages:generateResponse`
2. Use the IDs from Step 5
3. In the args editor, enter:
```json
{
  "conversationId": "k1234567890abcdefgh",
  "assistantMessageId": "x9876543210zyxwvuts",
  "modelKey": "flash"
}
```
4. Click "Call Function"
5. After a moment, you should get the AI's response back with the full generated text

## Step 7: Test Listing Messages

1. Click on `messages:getMessages`
2. In the args editor, enter:
```json
{
  "conversationId": "k1234567890abcdefgh"
}
```
3. Click "Call Function"
4. You should see all messages in that conversation:
```json
[
  {
    "_id": "...",
    "_creationTime": ...,
    "conversationId": "...",
    "role": "user",
    "content": "Hello! What's the capital of France?"
  },
  {
    "_id": "...",
    "_creationTime": ...,
    "conversationId": "...",
    "role": "assistant",
    "content": "The capital of France is Paris..."
  }
]
```

## Step 8: Test Listing Conversations

1. Click on `conversations:listConversations`
2. Leave args empty (or optionally add `"limit": 10`)
3. Click "Call Function"
4. You should see your conversations ordered by most recent:
```json
[
  {
    "_id": "...",
    "_creationTime": ...,
    "title": "Test Chat",
    "model": "flash",
    "createdAt": 1729361000000,
    "updatedAt": 1729361050000
  }
]
```

## Step 9: Test Searching Conversations

1. Click on `conversations:searchConversations`
2. In the args editor, enter:
```json
{
  "q": "test"
}
```
3. Click "Call Function"
4. You should get conversations matching the prefix search

## Step 10: Test Updating Conversation Title

1. Click on `conversations:updateConversationTitle`
2. In the args editor, enter:
```json
{
  "conversationId": "k1234567890abcdefgh",
  "newTitle": "Amazing Chat About Capitals"
}
```
3. Click "Call Function"
4. You should get back the updated conversation

## Step 11: Test in the UI (Optional)

The Chat UI is ready on `http://localhost:3000` but needs to be wired to use the Convex functions. For now, test via the Convex Dashboard.

## Troubleshooting

### "Missing GOOGLE_GENERATIVE_AI_API_KEY" Error

Make sure your `.env.local` has:
```
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyCklgomPFo_H1rYcRWQIHSMtyxNLjaPBX4
```

### "Conversation not found" Error

Make sure you're using a valid `conversationId` from your database. Copy from a previous successful call.

### TypeScript Errors

Run:
```bash
pnpm convex dev --typecheck enable
```

### Functions Not Showing in Dashboard

1. Make sure `convex dev` is still running
2. Try refreshing the dashboard
3. Check for errors in the terminal where `convex dev` is running

## Next Steps

After confirming all backend functions work:
1. Wire up the React UI to use `useMutation` and `useQuery` hooks
2. Implement streaming UI to show messages in real-time
3. Add sidebar navigation for conversation history
4. Implement search functionality in the UI
