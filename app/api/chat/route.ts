import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

// --- Method to Stream Text ---

export async function POST(request: Request) {
    const { messages , model} = await request.json();

    // --- We Create Custom Map for Model Names --- 
    const modelMap: Record<string , string> = {
        'gemini-pro': 'gemini-2.5-pro',
        'gemini-flash': 'gemini-flash-latest',
        'gemini-lite': 'gemini-flash-lite-latest'
    }
    const selectedModel = modelMap[model] || 'gemini-2.5-flash';

    try {
        const result = streamText({
            model: google(selectedModel),
            messages,
            system: 'You are a helpful AI Assistant Powered by Gemini '
        })
        // --- Here We Use Text Stream Response --- 
        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Error streaming text:', error);
        return new Response('Internal Server Error', { status: 500 });
    }

}