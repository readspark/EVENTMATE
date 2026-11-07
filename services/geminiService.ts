import type { AgendaItem, Event } from '../types';

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
    return Array.isArray(ideas) ? ideas : [];
  } catch (error) {
    console.error("Error generating event ideas:", error);
    // Reliable fallback sample ideas
    return [
      {
        title: `${theme} Executive Symposium 2026`,
        description: `A strategic executive gathering focused on ${theme}. Features keynote insights, high-density practitioner roundtables, and cross-functional leadership breakouts.\n\nTarget Audience: Senior leaders, strategists, and domain specialists.\nPotential Guests: Industry innovators and research directors.\nKey Activities: Keynote address, interactive policy workshop, and curated networking dinner.`
      },
      {
        title: `${theme} Hands-on Masterclass`,
        description: `A comprehensive half-day workshop diving deep into practical implementation frameworks for ${theme}.\n\nTarget Audience: Technical practitioners, team leads, and product operators.\nPotential Guests: Staff engineers and leading workshop facilitators.\nKey Activities: Live architectural teardowns, collaborative breakout labs, and lightning Q&A.`
      }
    ];
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
      subject: `Upcoming Event Reminder: ${event.title}`,
      body: `Hi there,

This is a reminder regarding our upcoming session for ${event.title}.

Event Details:
• Title: ${event.title}
• Date & Time: ${event.date} ${event.time ? `(${event.time})` : ''}
• Location: ${event.location}

Please arrive 10 minutes early for badge pick-up or virtual connection check. If you have any dietary requirements or accessibility needs, simply reply directly to this email.

We look forward to an insightful session together!

Warm regards,
${plannerName || 'The Event Organizing Team'}`
    };
  }
};

export const generateAgenda = async (eventTitle: string, eventDescription: string, durationHours: number = 4): Promise<AgendaItem[]> => {
  try {
    const response = await fetch('/api/gemini/generate-agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventTitle, eventDescription, durationHours }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${response.status}`);
    }

    const items = await response.json();
    return (items || []).map((item: any, idx: number) => ({
      id: `ag-gen-${Date.now()}-${idx}`,
      time: item.time || `${9 + idx}:00 AM`,
      title: item.title || `Session ${idx + 1}`,
      speakerOrLead: item.speakerOrLead || 'Session Lead',
      notes: item.notes || ''
    }));
  } catch (error) {
    console.error("Error generating agenda:", error);
    // Reliable fallback agenda
    return [
      { id: `ag-${Date.now()}-1`, time: "09:00 AM", title: "Registration & Welcome Reception", speakerOrLead: "Host Committee", notes: "Check-in and morning refreshments" },
      { id: `ag-${Date.now()}-2`, time: "09:45 AM", title: `Opening Keynote: Future of ${eventTitle}`, speakerOrLead: "Guest Keynote Speaker", notes: "Main Stage" },
      { id: `ag-${Date.now()}-3`, time: "11:00 AM", title: "Deep Dive Panel & Case Studies", speakerOrLead: "Expert Panelists", notes: "Q&A via audience app" },
      { id: `ag-${Date.now()}-4`, time: "12:30 PM", title: "Curated Lunch & Executive Networking", speakerOrLead: "All Participants", notes: "Dining Courtyard" },
      { id: `ag-${Date.now()}-5`, time: "02:00 PM", title: "Interactive Workshop Breakouts", speakerOrLead: "Session Leads", notes: "Rooms A, B, and C" },
      { id: `ag-${Date.now()}-6`, time: "03:45 PM", title: "Synthesis, Next Steps & Closing Toast", speakerOrLead: "Organizing Team", notes: "Main Stage" }
    ];
  }
};

export const generateMarketingCopy = async (
  event: Event, 
  channel: 'Email' | 'LinkedIn' | 'Twitter/X' = 'LinkedIn'
): Promise<{ headline: string; content: string; hashtags: string[] }> => {
  try {
    const response = await fetch('/api/gemini/generate-marketing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, channel }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating promotional copy:", error);
    if (channel === 'Email') {
      return {
        headline: `Exclusive Invitation: ${event.title}`,
        content: `Dear Colleague,\n\nYou are cordially invited to join us for ${event.title}.\n\nWhen: ${event.date} ${event.time ? `(${event.time})` : ''}\nWhere: ${event.location}\n\n${event.description}\n\nSpace is strictly limited to ensure an engaging, high-signal experience. Please confirm your registration at your earliest convenience.`,
        hashtags: ['#EventInvitation', '#Networking', '#Leadership']
      };
    } else if (channel === 'Twitter/X') {
      return {
        headline: `Announcing: ${event.title}`,
        content: `Excited to announce ${event.title}! 🚀\n\n📅 ${event.date}\n📍 ${event.location}\n\n${event.description.slice(0, 120)}...\n\nSeats are limited. Secure your spot now!`,
        hashtags: ['#TechEvents', '#Conference', '#Innovation']
      };
    } else {
      return {
        headline: `Join Us at ${event.title}`,
        content: `We're thrilled to officially announce ${event.title}.\n\nIn a fast-evolving landscape, gathering the right minds in one room makes all the difference. This session brings together leaders and practitioners for deep conversations, tactical insights, and meaningful connections.\n\n📅 Date: ${event.date}\n📍 Location: ${event.location}\n\nLearn more and reserve your pass below. Looking forward to seeing you there!`,
        hashtags: ['#Leadership', '#Innovation', '#Networking', '#IndustryEvents']
      };
    }
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
