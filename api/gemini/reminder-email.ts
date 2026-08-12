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
    const { event, plannerName } = body;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Generate a friendly and professional reminder email for the following event. The subject should be exciting and the body should remind attendees of the key details (name, date, location) and build anticipation.
      
      The email should be signed off by "${plannerName || 'The Event Team'}".

      Event Details:
      ${JSON.stringify({ title: event?.title, date: event?.date, location: event?.location, description: event?.description }, null, 2)}
      
      Provide the output in JSON format with "subject" and "body" keys.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: 'The subject line for the reminder email.',
            },
            body: {
              type: Type.STRING,
              description: 'The body content of the reminder email. Use newline characters for line breaks.',
            },
          },
          required: ["subject", "body"],
        },
      },
    });

    const jsonText = (response.text || "").trim();
    const reminder = JSON.parse(jsonText);
    return res.status(200).json(reminder);
  } catch (error: any) {
    console.error("Error generating reminder email:", error);
    return res.status(500).json({ error: error.message || "Failed to generate reminder email" });
  }
}
