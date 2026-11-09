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
    const { 
      eventTitle, 
      eventDescription, 
      eventTime, 
      category, 
      location, 
      isVirtual, 
      durationHours 
    } = body;

    if (!eventTitle) {
      return res.status(400).json({ error: "Event title is required" });
    }

    const scheduledTime = eventTime?.trim() || `${durationHours || 4} hours starting at 09:00 AM`;

    const prompt = `You are an elite event director and executive producer.
Generate a realistic, prestigious, and chronologically precise Run-of-Show timeline and agenda for this event:

EVENT DETAILS:
- Event Title: "${eventTitle}"
- Category: "${category || 'Conference'}"
- Scheduled Time Window: "${scheduledTime}"
- Format: ${isVirtual ? 'Virtual / Online Stream' : 'In-Person Venue'}
- Location: "${location || (isVirtual ? 'Virtual Stream' : 'Event Venue')}"
- Description / Brief: "${eventDescription || ''}"

CRITICAL MANDATORY RULES:
1. STRICT TIME WINDOW ACCURACY:
   - The timeline MUST start exactly at the start time of the scheduled window ("${scheduledTime}").
   - For example: if the event is "06:30 PM - 09:30 PM", the first agenda item MUST be at "06:30 PM", subsequent items must advance chronologically (e.g., 07:15 PM, 08:00 PM, 08:45 PM), and the final wrap-up concludes around "09:30 PM".
   - If the event is in the afternoon or evening, NEVER start with morning times like "09:00 AM". All timestamps MUST be formatted as "HH:MM AM/PM" strictly within "${scheduledTime}".
   - Provide 4 to 6 evenly paced, realistic sequential sessions spanning the entire duration.

2. STRICT TOPIC & DOMAIN GROUNDING (NO OFF-TOPIC OR GENERIC FILLER):
   - Every single session title, topic, speaker role, and note MUST be deeply grounded in the event's exact domain, subject matter, and industry described in "${eventTitle}" and "${eventDescription || ''}".
   - Do NOT use generic titles like "Session 1", "General Keynote", "Coffee Break", or off-topic conference tropes.
   - Use authentic domain terminology and compelling session titles that an attendee would be thrilled to see.

3. TAILOR TO EVENT CATEGORY:
   - If Category is "Networking" or evening mixer: Focus on arrival drinks & check-in, lightning 5-minute spotlight pitches, curated peer circles, and closing toast.
   - If Category is "Workshop": Focus on architecture teardowns, interactive hands-on lab exercises, peer audits, and implementation Q&A.
   - If Category is "Conference" or "Executive": Focus on high-signal keynotes, expert panel debates, curated luncheon/breakout discussions, and executive synthesis.
   - If Category is "Webinar": Focus on streaming kickoff, live platform demonstration, audience Q&A, and digital takeaway synthesis.

4. LOGISTICAL NOTES:
   - Provide 1 brief, practical context sentence per item (e.g., "Main Stage", "Interactive Lab Suite", "Terrace Courtyard", "Live Stream Q&A", etc.).`;

    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            time: { 
              type: Type.STRING,
              description: "Sequential timestamp strictly within the scheduled event time window, formatted as 'HH:MM AM/PM' (e.g. '06:30 PM')",
            },
            title: { 
              type: Type.STRING,
              description: "Deeply tailored, on-topic session or segment title relevant to the event subject",
            },
            speakerOrLead: { 
              type: Type.STRING,
              description: "Role, speaker name, or facilitator appropriate for this specific domain",
            },
            notes: { 
              type: Type.STRING,
              description: "Concise logistical context, location room, or format note",
            },
          },
          required: ["time", "title", "speakerOrLead", "notes"],
        },
      },
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config,
      });
    } catch (modelErr: any) {
      console.warn("Primary model error, retrying with gemini-3.6-flash:", modelErr.message);
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config,
      });
    }

    const jsonText = (response.text || "").trim();
    const agendaItems = JSON.parse(jsonText);
    return res.status(200).json(agendaItems);
  } catch (error: any) {
    console.error("Error generating agenda:", error);
    return res.status(500).json({ error: error.message || "Failed to generate agenda" });
  }
}
