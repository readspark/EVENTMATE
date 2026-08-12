import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is missing on Vercel. Please set GEMINI_API_KEY in your Vercel Project Settings > Environment Variables." 
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { history, question, events } = body;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are EventMate, an AI assistant for an event planner.
      Your goal is to help the user plan and organize their events. You can suggest themes, provide marketing tips, help with scheduling, or answer questions about the events they are currently planning.
      Be creative, helpful, and concise.

      Here are the events the user is currently planning:
      ${JSON.stringify(events || [], null, 2)}

      Here is the conversation history:
      ${history || ''}

      Answer the following user question: "${question}"`,
    });

    return res.status(200).json({ text: response.text || "I'm sorry, I couldn't process that request." });
  } catch (error: any) {
    console.error("Error getting chatbot response:", error);
    return res.status(500).json({ error: error.message || "Failed to get chatbot response" });
  }
}
