import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BUSINESS_CONFIG } from '@/config/business';
import { TimeSlot } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns current timestamp in Asia/Kolkata as a Date object representation
 */
export function getNowInIST(): Date {
  // Convert current UTC time to Asia/Kolkata
  const now = new Date();
  const istString = now.toLocaleString('en-US', { timeZone: BUSINESS_CONFIG.timezone });
  return new Date(istString);
}

/**
 * Returns current date string in YYYY-MM-DD format in Asia/Kolkata
 */
export function getCurrentDateIST(): string {
  const ist = getNowInIST();
  const year = ist.getFullYear();
  const month = String(ist.getMonth() + 1).padStart(2, '0');
  const day = String(ist.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current time string in HH:mm 24h format in Asia/Kolkata
 */
export function getCurrentTimeIST(): string {
  const ist = getNowInIST();
  const hours = String(ist.getHours()).padStart(2, '0');
  const minutes = String(ist.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Converts HH:mm to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Converts minutes from midnight to HH:mm (24h)
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Adds minutes to an HH:mm string
 */
export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  return minutesToTime(timeToMinutes(timeStr) + minutesToAdd);
}

/**
 * Formats HH:mm (24h) to "h:mm A" (e.g., "11:15 AM")
 */
export function formatDisplayTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hours24, minutes] = timeStr.split(':').map(Number);
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Formats YYYY-MM-DD into a human-friendly string e.g. "Thursday, Oct 15"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  // Construct date safely without timezone shift
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats YYYY-MM-DD into full date e.g. "Thursday, October 15, 2026"
 */
export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Checks if a given date string is operating day according to business config
 */
export function isOperatingDate(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon ...
  return BUSINESS_CONFIG.operatingDays.includes(dayOfWeek);
}

/**
 * Generates an array of upcoming selectable dates (up to bookingHorizonDays)
 */
export function getAvailableDates(): Array<{
  dateStr: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  isOperating: boolean;
}> {
  const dates = [];
  const todayIST = getNowInIST();

  for (let i = 0; i < BUSINESS_CONFIG.bookingHorizonDays; i++) {
    const d = new Date(todayIST);
    d.setDate(todayIST.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayOfWeek = d.getDay();
    const isOperating = BUSINESS_CONFIG.operatingDays.includes(dayOfWeek);

    dates.push({
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
      isOperating,
    });
  }

  return dates;
}

/**
 * Checks if a time falls into any configured breaks
 */
function isTimeInBreak(timeStr: string): boolean {
  const slotMinutes = timeToMinutes(timeStr);
  const slotEndMinutes = slotMinutes + BUSINESS_CONFIG.durationMinutes;

  for (const b of BUSINESS_CONFIG.breaks) {
    const breakStart = timeToMinutes(b.start);
    const breakEnd = timeToMinutes(b.end);

    // Overlaps if slot starts before break ends and ends after break starts
    if (slotMinutes < breakEnd && slotEndMinutes > breakStart) {
      return true;
    }
  }
  return false;
}

/**
 * Dynamically generates all 15-minute time slots for a given date
 * Computes availability considering operating hours, breaks, past time (if today),
 * and existing active confirmed/completed bookings.
 */
export function generateSlotsForDate(
  dateStr: string,
  bookedStartTimes: string[] = []
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const isOperating = isOperatingDate(dateStr);
  if (!isOperating) return slots;

  const openMinutes = timeToMinutes(BUSINESS_CONFIG.operatingHours.open);
  const closeMinutes = timeToMinutes(BUSINESS_CONFIG.operatingHours.close);
  const step = BUSINESS_CONFIG.durationMinutes;

  const isToday = dateStr === getCurrentDateIST();
  const currentMinutesIST = isToday ? timeToMinutes(getCurrentTimeIST()) : -1;
  const minNotice = BUSINESS_CONFIG.minAdvanceNoticeMinutes;

  const bookedSet = new Set(bookedStartTimes);
  const isFullyBookedDate = (BUSINESS_CONFIG.fullyBookedDates || []).includes(dateStr);

  for (let m = openMinutes; m + step <= closeMinutes; m += step) {
    const timeStr = minutesToTime(m);
    const endTimeStr = minutesToTime(m + step);

    let available = true;
    let reason: TimeSlot['reason'] = undefined;

    // Check if within break window
    if (isTimeInBreak(timeStr)) {
      available = false;
      reason = 'break';
    }
    // Check if fully booked date or already reserved
    else if (isFullyBookedDate || bookedSet.has(timeStr)) {
      available = false;
      reason = 'booked';
    }
    // Check if in the past (including advance notice requirement)
    else if (isToday && m <= currentMinutesIST + minNotice) {
      available = false;
      reason = 'past';
    }

    slots.push({
      time: timeStr,
      formattedTime: formatDisplayTime(timeStr),
      endTime: endTimeStr,
      formattedEndTime: formatDisplayTime(endTimeStr),
      available,
      reason,
    });
  }

  return slots;
}

/**
 * Generates an elegant, unambiguous booking reference code:
 * e.g., RR-20261015-8K2D
 */
export function generateBookingId(dateStr: string): string {
  const cleanDate = dateStr.replace(/-/g, '');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid O, 0, 1, I
  let randomSuffix = '';
  for (let i = 0; i < 4; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RR-${cleanDate}-${randomSuffix}`;
}
