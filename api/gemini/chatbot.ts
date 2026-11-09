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
      contents: `You are EventMate, a direct, executive event planning assistant.

INSTRUCTION: Answer in direct, definite, clear words.
- Provide definite, authoritative answers immediately without any preamble.
- Do NOT use filler phrases or conversational pleasantries (NO "Sure!", "I'd be happy to help", "Certainly", "Great question", "Hello there").
- Give exact numbers, specific recommendations, and concrete steps.
- Speak in definite, confident statements. Avoid vague qualifiers like "maybe", "you might consider", or "it depends". State the best choice directly.
- Keep responses concise, high-signal, and easy to execute.

User's active events portfolio:
${JSON.stringify(events || [], null, 2)}

Prior conversation:
${history || ''}

User's question:
"${question}"`,
    });

    return res.status(200).json({ text: response.text || "No response generated." });
  } catch (error: any) {
    console.error("Error getting chatbot response:", error);
    return res.status(500).json({ error: error.message || "Failed to get chatbot response" });
  }
}
