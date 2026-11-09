/**
 * Date formatting and parsing utility tailored to Indian standard date formats (DD/MM/YYYY).
 */

/**
 * Parses a date string that may be in DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD format.
 */
export function parseIndianDate(dateStr?: string): Date {
  if (!dateStr || typeof dateStr !== 'string') {
    return new Date();
  }

  const trimmed = dateStr.trim();

  // Match DD/MM/YYYY or DD-MM-YYYY
  const indianMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (indianMatch) {
    const day = parseInt(indianMatch[1], 10);
    const month = parseInt(indianMatch[2], 10) - 1; // 0-indexed month in JS
    const year = parseInt(indianMatch[3], 10);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Fallback to standard Date parsing (e.g., YYYY-MM-DD or ISO)
  const standardDate = new Date(trimmed);
  if (!isNaN(standardDate.getTime())) {
    return standardDate;
  }

  return new Date();
}

/**
 * Formats any date string or Date object into standard Indian format: DD/MM/YYYY
 * Example: "2026-11-24" -> "24/11/2026"
 */
export function formatIndianDate(dateInput?: string | Date): string {
  if (!dateInput) return 'DD/MM/YYYY';

  let d: Date;
  if (typeof dateInput === 'string') {
    d = parseIndianDate(dateInput);
  } else {
    d = dateInput;
  }

  if (isNaN(d.getTime())) return 'DD/MM/YYYY';

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formats date into readable Indian English: e.g. "24 Nov 2026"
 */
export function formatIndianDateLong(dateInput?: string | Date): string {
  if (!dateInput) return '';

  const d = typeof dateInput === 'string' ? parseIndianDate(dateInput) : dateInput;
  if (isNaN(d.getTime())) return typeof dateInput === 'string' ? dateInput : '';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = d.getDate().toString().padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Returns today's date formatted as DD/MM/YYYY
 */
export function getTodayIndianDate(): string {
  return formatIndianDate(new Date());
}

/**
 * Normalizes input date string to DD/MM/YYYY. If invalid, returns today's date in DD/MM/YYYY.
 */
export function normalizeToIndianDate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return getTodayIndianDate();
  return formatIndianDate(parseIndianDate(dateStr));
}

/**
 * Helper to parse a time string like "09:00 AM", "5:30 PM", "14:00", "9am" into { hours, minutes }
 */
function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const trimmed = timeStr.trim().toLowerCase();
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3];

  if (ampm === 'pm' && hours < 12) {
    hours += 12;
  } else if (ampm === 'am' && hours === 12) {
    hours = 0;
  }

  if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
    return { hours, minutes };
  }
  return null;
}

/**
 * Dynamically computes an event's status ('Upcoming', 'In Progress', or 'Completed')
 * based on its date and time relative to current time.
 */
export function getEventStatus(event?: { date?: string; time?: string }): 'Upcoming' | 'In Progress' | 'Completed' {
  if (!event || !event.date) return 'Upcoming';

  const dateObj = parseIndianDate(event.date);
  const now = new Date();

  // Create start and end Date objects for the event
  let start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0);
  let end = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59);

  if (event.time && event.time.trim()) {
    const rawTime = event.time.trim();
    // Check if time range is provided (e.g. "09:00 AM - 05:00 PM" or "10:00 AM to 02:00 PM")
    const rangeParts = rawTime.split(/[-–—]|(?:\s+to\s+)/i);

    if (rangeParts.length >= 2) {
      const startTimeParsed = parseTimeString(rangeParts[0]);
      const endTimeParsed = parseTimeString(rangeParts[1]);

      if (startTimeParsed) {
        start.setHours(startTimeParsed.hours, startTimeParsed.minutes, 0, 0);
      }
      if (endTimeParsed) {
        end.setHours(endTimeParsed.hours, endTimeParsed.minutes, 59, 999);
      }
    } else {
      // Single time specified (e.g. "10:00 AM")
      const singleTimeParsed = parseTimeString(rawTime);
      if (singleTimeParsed) {
        start.setHours(singleTimeParsed.hours, singleTimeParsed.minutes, 0, 0);
        // Default end time to 2 hours after start, or end of day
        end.setHours(Math.min(23, singleTimeParsed.hours + 2), singleTimeParsed.minutes, 59, 999);
      }
    }
  }

  if (now < start) {
    return 'Upcoming';
  } else if (now >= start && now <= end) {
    return 'In Progress';
  } else {
    return 'Completed';
  }
}
