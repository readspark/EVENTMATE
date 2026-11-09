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
