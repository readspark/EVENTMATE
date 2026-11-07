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
    const { eventTitle, eventDescription, durationHours } = body;

    if (!eventTitle) {
      return res.status(400).json({ error: "Event title is required" });
    }

    const prompt = `Create a realistic, professional Run-of-Show timeline and agenda for this event:
Title: "${eventTitle}"
Description: "${eventDescription || ''}"
Estimated Duration: ${durationHours || 4} hours.

Generate between 4 to 7 sequential agenda items.
Each item must have:
- time: Realistic time string formatted as HH:MM AM/PM (e.g. "09:00 AM", "10:30 AM")
- title: Concise professional segment name (e.g. "Keynote: Architectural Shifts", "Interactive Working Group")
- speakerOrLead: Role, speaker title, or facilitator
- notes: 1 brief sentence with logistical context or location within venue`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              title: { type: Type.STRING },
              speakerOrLead: { type: Type.STRING },
              notes: { type: Type.STRING },
            },
            required: ["time", "title", "speakerOrLead", "notes"],
          },
        },
      },
    });

    const jsonText = (response.text || "").trim();
    const agendaItems = JSON.parse(jsonText);
    return res.status(200).json(agendaItems);
  } catch (error: any) {
    console.error("Error generating agenda:", error);
    return res.status(500).json({ error: error.message || "Failed to generate agenda" });
  }
}
