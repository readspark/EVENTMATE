import { GoogleGenAI, Type } from "@google/genai";

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
    const { theme } = body;
    if (!theme) {
      return res.status(400).json({ error: "Theme is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Generate two creative and engaging event ideas based on the theme: "${theme}".
      For each idea, provide a catchy title and a detailed description.
      The description should be a single string, using newlines for formatting, and must cover these points:
      - A compelling overview of the event.
      - **Target Audience:** Who to invite.
      - **Potential Guests/Speakers:** Suggestions for interesting guests or speakers.
      - **Key Activities:** What will happen at the event.
      - **Judges:** (If it's a competition) Who could be a judge.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'The catchy title of the event.',
              },
              description: {
                type: Type.STRING,
                description: 'A detailed event description including an overview, target audience, potential guests/speakers, key activities, and judges (if applicable). The description should use newlines for formatting.',
              },
            },
            required: ["title", "description"],
          },
        },
      },
    });

    const jsonText = (response.text || "").trim();
    const ideas = JSON.parse(jsonText);
    return res.status(200).json(ideas);
  } catch (error: any) {
    console.error("Error generating event ideas:", error);
    return res.status(500).json({ error: error.message || "Failed to generate ideas" });
  }
}
