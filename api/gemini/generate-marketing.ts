import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is missing." 
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
    const { event, channel } = body;

    if (!event || !event.title) {
      return res.status(400).json({ error: "Event data is required" });
    }

    const prompt = `You are an executive event communications director.
Draft promotional copy for the following event:
Title: "${event.title}"
Date: "${event.date}"
Location: "${event.location}"
Description: "${event.description || ''}"
Category: "${event.category || 'General'}"
Target Channel: "${channel || 'Email'}" (Options: Email, LinkedIn, Twitter/X)

Provide the output in JSON format with:
- headline: High-impact subject line or title hook
- content: Polished, ready-to-publish copy matching the chosen channel's conventions (no placeholder brackets [Insert Name], write realistic actionable copy)
- hashtags: Array of 3-5 relevant industry hashtags`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            content: { type: Type.STRING },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["headline", "content", "hashtags"],
        },
      },
    });

    const jsonText = (response.text || "").trim();
    const result = JSON.parse(jsonText);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error generating promotional copy:", error);
    return res.status(500).json({ error: error.message || "Failed to generate promotional copy" });
  }
}
