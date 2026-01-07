/**
 * Date utility functions for timezone conversion
 * Converts dates to PKT (Pakistan Standard Time) for SEO and logging
 * PKT is UTC+5 (Pakistan Standard Time)
 */

/**
 * Convert a date to PKT timezone and return as ISO string
 * PKT is UTC+5 (Pakistan Standard Time)
 * @param date - Date to convert (defaults to now)
 * @returns ISO string in PKT timezone (UTC+5)
 */
export function toPSTISOString(date: Date = new Date()): string {
  // PKT is UTC+5 (5 hours ahead of UTC)
  const pktOffsetHours = 5;
  
  // Get UTC components
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const milliseconds = date.getUTCMilliseconds();
  
  // Add PKT offset (5 hours) to get PKT time
  let pktHours = hours + pktOffsetHours;
  let pktDay = day;
  let pktMonth = month;
  let pktYear = year;
  
  // Handle day overflow (if hours >= 24)
  if (pktHours >= 24) {
    pktHours -= 24;
    pktDay += 1;
    // Handle month overflow
    const daysInMonth = new Date(pktYear, pktMonth + 1, 0).getDate();
    if (pktDay > daysInMonth) {
      pktDay = 1;
      pktMonth += 1;
      // Handle year overflow
      if (pktMonth >= 12) {
        pktMonth = 0;
        pktYear += 1;
      }
    }
  }
  
  // Format as ISO string with PKT offset (+05:00)
  const monthStr = String(pktMonth + 1).padStart(2, '0');
  const dayStr = String(pktDay).padStart(2, '0');
  const hoursStr = String(pktHours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');
  const millisecondsStr = String(milliseconds).padStart(3, '0');
  
  return `${pktYear}-${monthStr}-${dayStr}T${hoursStr}:${minutesStr}:${secondsStr}.${millisecondsStr}+05:00`;
}

/**
 * Convert a date to PKT and return formatted for console logs
 * @param date - Date to convert (defaults to now)
 * @returns Formatted PKT timestamp string
 */
export function toPSTTimestamp(date: Date = new Date()): string {
  return toPSTISOString(date);
}

/**
 * Get current date/time in PKT (Pakistan Standard Time)
 * @returns Date object adjusted to PKT (UTC+5)
 */
export function getPSTDate(): Date {
  const pktOffsetMinutes = 5 * 60; // +5 hours in minutes
  return new Date(Date.now() + (pktOffsetMinutes * 60 * 1000));
}

