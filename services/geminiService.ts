import type { Event } from '../types';

export const generateEventIdeas = async (theme: string): Promise<{title: string, description: string}[]> => {
  try {
    const response = await fetch('/api/gemini/generate-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${response.status}`);
    }

    const ideas = await response.json();
    return ideas;
  } catch (error) {
    console.error("Error generating event ideas:", error);
    return [];
  }
};

export const generateReminderEmail = async (event: Event, plannerName?: string): Promise<{subject: string, body: string}> => {
  try {
    const response = await fetch('/api/gemini/reminder-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, plannerName }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${response.status}`);
    }

    const reminder = await response.json();
    return reminder;
  } catch (error) {
    console.error("Error generating reminder email:", error);
    return {
      subject: `Reminder: ${event.title}`,
      body: `Hi there,

This is a friendly reminder about our upcoming event:

Event: ${event.title}
Date: ${event.date}
Location: ${event.location}

We look forward to seeing you there!

Best,
${plannerName || 'The Event Team'}`
    };
  }
};

export const getChatbotResponse = async (history: string, question: string, events: Event[]): Promise<string> => {
  try {
    const response = await fetch('/api/gemini/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, question, events }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
};
