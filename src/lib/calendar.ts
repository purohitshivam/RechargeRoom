import { Booking } from '@/types';
import { BUSINESS_CONFIG } from '@/config/business';
import { formatDisplayDate, formatDisplayTime } from '@/lib/utils';

/**
 * Converts a date (YYYY-MM-DD) and IST time (HH:mm) into an iCal UTC timestamp:
 * IST is UTC+05:30.
 * To convert IST -> UTC: subtract 5 hours and 30 minutes.
 */
function istToUtcIcalString(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // Date object in UTC representing IST local time
  const d = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  // Subtract 5 hours 30 minutes (330 minutes)
  d.setUTCMinutes(d.getUTCMinutes() - 330);

  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const dt = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const s = pad(d.getUTCSeconds());

  return `${y}${m}${dt}T${h}${min}${s}Z`;
}

/**
 * Builds standard iCalendar (.ics) format file content
 */
export function generateIcsContent(booking: Booking): string {
  const startUtc = istToUtcIcalString(booking.booking_date, booking.start_time);
  const endUtc = istToUtcIcalString(booking.booking_date, booking.end_time);
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const summary = `${BUSINESS_CONFIG.brandName} - 15-Minute Reset`;
  const description = [
    `Your 15-minute head, neck, and shoulder massage session at ${BUSINESS_CONFIG.brandName}.`,
    ``,
    `Booking Ref: ${booking.id}`,
    `Customer: ${booking.customer_name}`,
    `Date: ${formatDisplayDate(booking.booking_date)}`,
    `Time: ${formatDisplayTime(booking.start_time)} - ${formatDisplayTime(booking.end_time)}`,
    `Amount Due: ₹${booking.amount} (Pay in person after your session)`,
    ``,
    `Please arrive 2 minutes before your reserved slot.`,
  ].join('\\n');

  const location = BUSINESS_CONFIG.locationNote;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Recharge Room//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@rechargeroom.in`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generates direct Google Calendar web URL
 */
export function generateGoogleCalendarUrl(booking: Booking): string {
  const startUtc = istToUtcIcalString(booking.booking_date, booking.start_time);
  const endUtc = istToUtcIcalString(booking.booking_date, booking.end_time);

  const title = encodeURIComponent(`${BUSINESS_CONFIG.brandName} - 15-Minute Reset`);
  const details = encodeURIComponent(
    `Your 15-minute session is confirmed.\nRef: ${booking.id}\nAmount: ₹${booking.amount} (Pay in person after session).\nPlease arrive 2 minutes early.`
  );
  const location = encodeURIComponent(BUSINESS_CONFIG.locationNote);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
}
