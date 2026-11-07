import type { Event } from '../types';

/**
 * Generates and triggers download of a standardized RFC 5545 .ics calendar file.
 */
export const downloadIcsCalendarFile = (event: Event): boolean => {
  try {
    const formatIcsDate = (dateStr: string, timeStr?: string): string => {
      // Default to today if date is missing or invalid
      let d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        d = new Date();
      }

      // If time string exists (e.g., "09:00 AM" or "14:00"), parse hours & minutes
      if (timeStr) {
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const ampm = timeMatch[3]?.toUpperCase();

          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;

          d.setHours(hours, minutes, 0, 0);
        }
      } else {
        d.setHours(9, 0, 0, 0);
      }

      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    };

    const startDateFormatted = formatIcsDate(event.date, event.time?.split('-')[0]?.trim());
    
    // Set end date to 2 hours after start by default
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 2);
    const endDateFormatted = formatIcsDate(event.date, event.time?.split('-')[1]?.trim() || '11:00 AM');

    const cleanDescription = (event.description || '')
      .replace(/\r\n/g, '\n')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');

    const cleanTitle = (event.title || 'Event')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');

    const cleanLocation = (event.location || 'Online')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventMate Pro//Event Planning Operations//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:eventmate-${event.id}-${Date.now()}@eventmate.pro`,
      `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
      `DTSTART:${startDateFormatted}`,
      `DTEND:${endDateFormatted}`,
      `SUMMARY:${cleanTitle}`,
      `DESCRIPTION:${cleanDescription}`,
      `LOCATION:${cleanLocation}`,
      `STATUS:${event.status === 'Completed' ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    const icsContent = icsLines.join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    const sanitizedFileName = `${event.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_invite.ics`;
    
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', sanitizedFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    return true;
  } catch (err) {
    console.error("Failed to generate .ics file:", err);
    return false;
  }
};
