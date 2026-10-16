import fs from 'fs';
import path from 'path';
import os from 'os';
import { Booking, BookingStatus, CreateBookingInput, PaymentStatus, AdminDashboardMetrics } from '@/types';
import { BookingRepository, BookingFilters } from './types';
import {
  generateBookingId,
  addMinutesToTime,
  getCurrentDateIST,
  getCurrentTimeIST,
  timeToMinutes,
  isOperatingDate,
} from '@/lib/utils';
import { BUSINESS_CONFIG, CONTACT_CONFIG } from '@/config/business';

// Global in-memory cache to ensure serverless reliability even if filesystem is restricted
declare global {
  var __RECHARGE_ROOM_LOCAL_BOOKINGS__: Booking[] | undefined;
  var __RECHARGE_ROOM_SETTINGS__: Record<string, string> | undefined;
}

if (!globalThis.__RECHARGE_ROOM_LOCAL_BOOKINGS__) {
  globalThis.__RECHARGE_ROOM_LOCAL_BOOKINGS__ = [];
}
if (!globalThis.__RECHARGE_ROOM_SETTINGS__) {
  globalThis.__RECHARGE_ROOM_SETTINGS__ = {};
}

function getStoragePaths() {
  // On Vercel / AWS Lambda, process.cwd() is read-only (/var/task).
  // The only writable directory is os.tmpdir() (/tmp).
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';
  const baseDir = isServerless ? os.tmpdir() : process.cwd();
  const dataDir = path.join(baseDir, isServerless ? 'recharge-room' : 'data');
  const dbFile = path.join(dataDir, 'local-db.json');
  return { dataDir, dbFile };
}

// Concurrency mutex lock to prevent simultaneous writes in Node process
let writeLock: Promise<void> = Promise.resolve();

function acquireLock<T>(task: () => Promise<T>): Promise<T> {
  const result = writeLock.then(task);
  writeLock = result.then(() => {}, () => {});
  return result;
}

function ensureDbFile(): string | null {
  try {
    const { dataDir, dbFile } = getStoragePaths();
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dbFile)) {
      const seedFile = path.join(process.cwd(), 'data', 'local-db.json');
      let seeded = false;
      if (fs.existsSync(seedFile)) {
        try {
          fs.copyFileSync(seedFile, dbFile);
          seeded = true;
        } catch (_) {}
      }
      if (!seeded) {
        fs.writeFileSync(
          dbFile,
          JSON.stringify(
            {
              bookings: globalThis.__RECHARGE_ROOM_LOCAL_BOOKINGS__ || [],
              settings: globalThis.__RECHARGE_ROOM_SETTINGS__ || {},
            },
            null,
            2
          ),
          'utf-8'
        );
      }
    }
    return dbFile;
  } catch (err) {
    console.warn('[LocalDB] Notice: File persistence unavailable, using in-memory store:', err);
    return null;
  }
}

function readData(): { bookings: Booking[]; settings?: Record<string, string> } {
  const dbFile = ensureDbFile();
  if (dbFile) {
    try {
      const raw = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.bookings)) {
        globalThis.__RECHARGE_ROOM_LOCAL_BOOKINGS__ = parsed.bookings;
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        globalThis.__RECHARGE_ROOM_SETTINGS__ = {
          ...globalThis.__RECHARGE_ROOM_SETTINGS__,
          ...parsed.settings,
        };
      }
      return {
        bookings: globalThis.__RECHARGE_ROOM_LOCAL_BOOKINGS__ || [],
        settings: globalThis.__RECHARGE_ROOM_SETTINGS__ || {},
      };
    } catch (err) {
      console.warn('[LocalDB] Error reading local-db.json, using in-memory store:', err);
    }
  }
  return {
    bookings: globalThis.__RECHARGE_ROOM_LOCAL_BOOKINGS__ || [],
    settings: globalThis.__RECHARGE_ROOM_SETTINGS__ || {},
  };
}

function writeData(data: { bookings: Booking[]; settings?: Record<string, string> }): void {
  globalThis.__RECHARGE_ROOM_LOCAL_BOOKINGS__ = data.bookings;
  if (data.settings) {
    globalThis.__RECHARGE_ROOM_SETTINGS__ = data.settings;
  }
  const dbFile = ensureDbFile();
  if (dbFile) {
    try {
      const tmpFile = `${dbFile}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, dbFile);
    } catch (err) {
      console.warn('[LocalDB] Notice: Could not write to disk, in-memory updated:', err);
    }
  }
}

export class LocalBookingRepository implements BookingRepository {
  async getBookedSlots(dateStr: string): Promise<string[]> {
    try {
      const { bookings } = readData();
      return (bookings || [])
        .filter((b) => b.booking_date === dateStr && b.booking_status !== 'cancelled')
        .map((b) => b.start_time);
    } catch (err) {
      console.error('Error fetching booked slots in LocalBookingRepository:', err);
      return (globalThis.__RECHARGE_ROOM_LOCAL_BOOKINGS__ || [])
        .filter((b) => b.booking_date === dateStr && b.booking_status !== 'cancelled')
        .map((b) => b.start_time);
    }
  }

  async createBooking(input: CreateBookingInput): Promise<{
    success: boolean;
    booking?: Booking;
    error?: string;
  }> {
    return acquireLock(async () => {
      // 1. Validation checks
      if (!isOperatingDate(input.booking_date)) {
        return { success: false, error: 'Recharge Room is closed on this day.' };
      }

      const todayIST = getCurrentDateIST();
      const nowTimeIST = getCurrentTimeIST();

      if (input.booking_date < todayIST) {
        return { success: false, error: 'Cannot book slots in the past.' };
      }

      const slotMinutes = timeToMinutes(input.start_time);
      const openMinutes = timeToMinutes(BUSINESS_CONFIG.operatingHours.open);
      const closeMinutes = timeToMinutes(BUSINESS_CONFIG.operatingHours.close);

      if (slotMinutes < openMinutes || slotMinutes + BUSINESS_CONFIG.durationMinutes > closeMinutes) {
        return { success: false, error: 'Slot is outside operating hours.' };
      }

      // Check min advance notice if booking today
      if (input.booking_date === todayIST) {
        const currentMinutes = timeToMinutes(nowTimeIST);
        if (slotMinutes <= currentMinutes + BUSINESS_CONFIG.minAdvanceNoticeMinutes) {
          return { success: false, error: 'Slot has already started or requires more advance notice.' };
        }
      }

      const data = readData();

      // 2. Strict concurrency check: Is slot occupied?
      const existing = data.bookings.find(
        (b) =>
          b.booking_date === input.booking_date &&
          b.start_time === input.start_time &&
          b.booking_status !== 'cancelled'
      );

      if (existing) {
        return {
          success: false,
          error: 'This 15-minute slot was just booked by another customer. Please choose a different time.',
        };
      }

      // 3. Create booking
      let discount = 0;
      let finalAmount = BUSINESS_CONFIG.priceInr;
      if (input.coupon_code === 'RRMUFREE') {
        discount = 249;
        finalAmount = 0;
      } else if (input.coupon_code === 'RRMU50') {
        discount = 50;
        finalAmount = 199;
      } else if (input.discount_amount) {
        discount = input.discount_amount;
        finalAmount = Math.max(0, BUSINESS_CONFIG.priceInr - discount);
      }

      const newBooking: Booking = {
        id: generateBookingId(input.booking_date),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        booking_date: input.booking_date,
        start_time: input.start_time,
        end_time: addMinutesToTime(input.start_time, BUSINESS_CONFIG.durationMinutes),
        duration_minutes: BUSINESS_CONFIG.durationMinutes,
        customer_name: input.customer_name.trim(),
        customer_email: input.customer_email ? input.customer_email.trim().toLowerCase() : '',
        customer_phone: input.customer_phone.trim(),
        customer_type: input.customer_type,
        organization_unit: input.organization_unit ? input.organization_unit.trim() : '',
        notes: input.notes?.trim() || undefined,
        booking_status: 'confirmed',
        payment_status: 'pending',
        amount: finalAmount,
        coupon_code: input.coupon_code,
        discount_amount: discount > 0 ? discount : undefined,
        synced_to_sheets: false,
        synced_at: null,
      };

      data.bookings.push(newBooking);
      writeData(data);

      return { success: true, booking: newBooking };
    });
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const { bookings } = readData();
    const found = bookings.find((b) => b.id === id);
    return found || null;
  }

  async getAllBookings(filters?: BookingFilters): Promise<Booking[]> {
    const { bookings } = readData();
    let result = [...bookings];

    if (filters?.date) {
      result = result.filter((b) => b.booking_date === filters.date);
    }
    if (filters?.status) {
      result = result.filter((b) => b.booking_status === filters.status);
    }
    if (filters?.paymentStatus) {
      result = result.filter((b) => b.payment_status === filters.paymentStatus);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.customer_name.toLowerCase().includes(q) ||
          b.customer_phone.toLowerCase().includes(q) ||
          b.customer_email.toLowerCase().includes(q)
      );
    }

    // Sort by date DESC, start_time DESC
    return result.sort((a, b) => {
      const dateCmp = b.booking_date.localeCompare(a.booking_date);
      if (dateCmp !== 0) return dateCmp;
      return b.start_time.localeCompare(a.start_time);
    });
  }

  async updateBookingStatus(
    id: string,
    status: BookingStatus,
    cancellationReason?: string
  ): Promise<Booking | null> {
    return acquireLock(async () => {
      const data = readData();
      const index = data.bookings.findIndex((b) => b.id === id);
      if (index === -1) return null;

      data.bookings[index].booking_status = status;
      data.bookings[index].updated_at = new Date().toISOString();
      data.bookings[index].synced_to_sheets = false; // Trigger re-sync
      if (cancellationReason) {
        data.bookings[index].cancellation_reason = cancellationReason;
      }

      writeData(data);
      return data.bookings[index];
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Booking | null> {
    return acquireLock(async () => {
      const data = readData();
      const index = data.bookings.findIndex((b) => b.id === id);
      if (index === -1) return null;

      data.bookings[index].payment_status = status;
      data.bookings[index].updated_at = new Date().toISOString();
      data.bookings[index].synced_to_sheets = false; // Trigger re-sync

      writeData(data);
      return data.bookings[index];
    });
  }

  async markSyncedToSheets(id: string, success: boolean): Promise<void> {
    return acquireLock(async () => {
      const data = readData();
      const index = data.bookings.findIndex((b) => b.id === id);
      if (index === -1) return;

      data.bookings[index].synced_to_sheets = success;
      data.bookings[index].synced_at = success ? new Date().toISOString() : null;
      writeData(data);
    });
  }

  async getUnsyncedBookings(): Promise<Booking[]> {
    const { bookings } = readData();
    return bookings.filter((b) => !b.synced_to_sheets);
  }

  async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const { bookings } = readData();
    const today = getCurrentDateIST();

    const todayConfirmed = bookings.filter(
      (b) => b.booking_date === today && b.booking_status === 'confirmed'
    ).length;

    const upcomingBookings = bookings.filter(
      (b) => b.booking_date > today && b.booking_status === 'confirmed'
    ).length;

    const completedSessions = bookings.filter(
      (b) => b.booking_status === 'completed'
    ).length;

    const pendingPayments = bookings.filter(
      (b) => b.payment_status === 'pending' && b.booking_status !== 'cancelled'
    ).length;

    // Expected revenue: All confirmed or completed sessions
    const expectedRevenue = bookings
      .filter((b) => ['confirmed', 'completed'].includes(b.booking_status))
      .reduce((sum, b) => sum + (b.amount || 249), 0);

    // CRITICAL: Collected revenue strictly counts only bookings marked as 'paid'
    const collectedRevenue = bookings
      .filter((b) => b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.amount || 249), 0);

    const unsyncedCount = bookings.filter((b) => !b.synced_to_sheets).length;

    const webhookUrl =
      CONTACT_CONFIG.defaultWebhookUrl ||
      process.env.GOOGLE_SHEET_WEBHOOK_URL ||
      (await this.getSetting('google_sheet_webhook_url')) ||
      null;

    const hasServiceAccount = !!(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
    );

    const configuredMethod: 'webhook' | 'service_account' | 'none' = webhookUrl
      ? 'webhook'
      : hasServiceAccount
      ? 'service_account'
      : 'none';

    return {
      todayConfirmed,
      upcomingBookings,
      completedSessions,
      pendingPayments,
      expectedRevenue,
      collectedRevenue,
      sheetsSync: {
        total: bookings.length,
        synced: bookings.length - unsyncedCount,
        pending: unsyncedCount,
        isConfigured: configuredMethod !== 'none',
        configuredMethod,
        webhookUrl: webhookUrl ? `${webhookUrl.substring(0, 35)}...` : null,
      },
    };
  }

  async getSetting(key: string): Promise<string | null> {
    const { settings } = readData();
    return settings?.[key] || globalThis.__RECHARGE_ROOM_SETTINGS__?.[key] || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    return acquireLock(async () => {
      const data = readData();
      const updatedSettings = { ...(data.settings || {}), [key]: value };
      globalThis.__RECHARGE_ROOM_SETTINGS__ = updatedSettings;
      writeData({ ...data, settings: updatedSettings });
    });
  }
}
