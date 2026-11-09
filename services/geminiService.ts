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

export interface GenerateAgendaOptions {
  title: string;
  description?: string;
  time?: string;
  category?: string;
  location?: string;
  isVirtual?: boolean;
  durationHours?: number;
}

function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.trim().match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  if (!match) return 9 * 60;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = match[3]?.toUpperCase();

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, totalMinutes % (24 * 60));
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const meridian = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hStr = hours < 10 ? `0${hours}` : `${hours}`;
  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hStr}:${mStr} ${meridian}`;
}

export const generateAgenda = async (
  optionsOrTitle: string | GenerateAgendaOptions,
  legacyDescription?: string,
  legacyDurationHours: number = 4
): Promise<AgendaItem[]> => {
  const options: GenerateAgendaOptions = typeof optionsOrTitle === 'string'
    ? {
        title: optionsOrTitle,
        description: legacyDescription || '',
        durationHours: legacyDurationHours,
      }
    : optionsOrTitle;

  const { title, description = '', time = '', category = 'Conference', location = '', isVirtual = false, durationHours = 4 } = options;

  try {
    const response = await fetch('/api/gemini/generate-agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventTitle: title,
        eventDescription: description,
        eventTime: time,
        category,
        location,
        isVirtual,
        durationHours,
      }),
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
    
    // Parse scheduled start and end from time string if available
    let startMin = 9 * 60; // 09:00 AM
    let endMin = 13 * 60;  // 01:00 PM
    if (time.includes('-')) {
      const parts = time.split('-');
      if (parts[0]) startMin = parseTimeToMinutes(parts[0]);
      if (parts[1]) endMin = parseTimeToMinutes(parts[1]);
      if (endMin <= startMin) endMin = startMin + 240;
    } else if (time) {
      startMin = parseTimeToMinutes(time);
      endMin = startMin + 240;
    }

    const totalSpan = endMin - startMin;
    const slotCount = category === 'Networking' ? 4 : 5;
    const step = Math.floor(totalSpan / slotCount);

    const timeSlots = Array.from({ length: slotCount }, (_, i) => formatMinutesToTime(startMin + (i * step)));

    if (category === 'Networking') {
      return [
        { id: `ag-${Date.now()}-1`, time: timeSlots[0], title: `Welcome Cocktails & Attendee Check-In`, speakerOrLead: "Event Concierge", notes: isVirtual ? "Virtual lounge lobby" : "Welcome foyer" },
        { id: `ag-${Date.now()}-2`, time: timeSlots[1], title: `Lightning Spotlight: Introductions & Thematic Focus on ${title}`, speakerOrLead: "Featured Hosts", notes: "Main Stage / Spotlight Area" },
        { id: `ag-${Date.now()}-3`, time: timeSlots[2], title: `Curated Peer Networking & Strategic Discussion`, speakerOrLead: "All Attendees", notes: "Open networking lounge" },
        { id: `ag-${Date.now()}-4`, time: timeSlots[3], title: `Closing Toast & Community Next Steps`, speakerOrLead: "Organizing Committee", notes: "Wrap-up and contact exchange" }
      ];
    } else if (category === 'Workshop') {
      return [
        { id: `ag-${Date.now()}-1`, time: timeSlots[0], title: `Orientation & Architecture Setup: ${title}`, speakerOrLead: "Workshop Director", notes: isVirtual ? "Repository setup & audio check" : "Lab classroom entrance" },
        { id: `ag-${Date.now()}-2`, time: timeSlots[1], title: `Hands-On Lab: Core Practical Patterns in ${title}`, speakerOrLead: "Technical Lead", notes: "Interactive exercise part 1" },
        { id: `ag-${Date.now()}-3`, time: timeSlots[2], title: `Implementation Teardown & Live Group Review`, speakerOrLead: "Staff Specialist", notes: "Breakout feedback & review" },
        { id: `ag-${Date.now()}-4`, time: timeSlots[3], title: `Advanced Problem Solving & Practical Frameworks`, speakerOrLead: "Workshop Director", notes: "Hands-on challenge part 2" },
        { id: `ag-${Date.now()}-5`, time: timeSlots[4], title: `Synthesis, Q&A and Distribution Package`, speakerOrLead: "Instructors", notes: "Key takeaway artifacts provided" }
      ];
    } else {
      return [
        { id: `ag-${Date.now()}-1`, time: timeSlots[0], title: `Registration & Opening Reception`, speakerOrLead: "Host Committee", notes: isVirtual ? "Digital lobby check-in" : "Main registration desk" },
        { id: `ag-${Date.now()}-2`, time: timeSlots[1], title: `Keynote: The Horizon of ${title}`, speakerOrLead: "Keynote Guest", notes: "Main Stage Auditorium" },
        { id: `ag-${Date.now()}-3`, time: timeSlots[2], title: `Deep Dive Panel: Tactical Execution & Case Studies`, speakerOrLead: "Distinguished Panelists", notes: "Audience Q&A enabled" },
        { id: `ag-${Date.now()}-4`, time: timeSlots[3], title: `Interactive Working Session & Specialized Breakouts`, speakerOrLead: "Session Facilitators", notes: "Breakout Rooms & Discussions" },
        { id: `ag-${Date.now()}-5`, time: timeSlots[4], title: `Synthesis, Action Items & Closing Remarks`, speakerOrLead: "Organizing Team", notes: "Main Stage wrap-up" }
      ];
    }
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
