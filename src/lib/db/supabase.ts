import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, BookingStatus, CreateBookingInput, PaymentStatus, AdminDashboardMetrics } from '@/types';
import { BookingRepository, BookingFilters } from './types';
import {
  generateBookingId,
  addMinutesToTime,
  getCurrentDateIST,
  isOperatingDate,
} from '@/lib/utils';
import { BUSINESS_CONFIG } from '@/config/business';

export class SupabaseBookingRepository implements BookingRepository {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    this.client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  async getBookedSlots(dateStr: string): Promise<string[]> {
    const { data, error } = await this.client
      .from('bookings')
      .select('start_time')
      .eq('booking_date', dateStr)
      .neq('booking_status', 'cancelled');

    if (error) {
      console.error('Error fetching booked slots from Supabase:', error);
      return [];
    }

    return (data || []).map((row) => row.start_time.substring(0, 5)); // "11:15:00" -> "11:15"
  }

  async createBooking(input: CreateBookingInput): Promise<{
    success: boolean;
    booking?: Booking;
    error?: string;
  }> {
    if (!isOperatingDate(input.booking_date)) {
      return { success: false, error: 'Recharge Room is closed on this day.' };
    }

    const bookingId = generateBookingId(input.booking_date);
    const endTime = addMinutesToTime(input.start_time, BUSINESS_CONFIG.durationMinutes);

    // Call atomic Postgres stored procedure
    const { data, error } = await this.client.rpc('create_booking_atomic', {
      p_id: bookingId,
      p_booking_date: input.booking_date,
      p_start_time: input.start_time,
      p_end_time: endTime,
      p_duration_minutes: BUSINESS_CONFIG.durationMinutes,
      p_customer_name: input.customer_name.trim(),
      p_customer_email: input.customer_email.trim().toLowerCase(),
      p_customer_phone: input.customer_phone.trim(),
      p_customer_type: input.customer_type,
      p_organization_unit: input.organization_unit.trim(),
      p_notes: input.notes?.trim() || null,
      p_amount: BUSINESS_CONFIG.priceInr,
    });

    if (error) {
      console.error('Supabase RPC error creating booking:', error);
      // Check for unique conflict code
      if (error.code === '23505') {
        return {
          success: false,
          error: 'This slot was just reserved by another customer. Please choose a different time.',
        };
      }
      return { success: false, error: error.message || 'Unable to confirm booking. Please try again.' };
    }

    if (!data.success) {
      return { success: false, error: data.message };
    }

    return { success: true, booking: data.booking };
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await this.client
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapRowToBooking(data);
  }

  async getAllBookings(filters?: BookingFilters): Promise<Booking[]> {
    let query = this.client.from('bookings').select('*');

    if (filters?.date) {
      query = query.eq('booking_date', filters.date);
    }
    if (filters?.status) {
      query = query.eq('booking_status', filters.status);
    }
    if (filters?.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }
    if (filters?.search) {
      const q = filters.search;
      query = query.or(
        `id.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`
      );
    }

    query = query.order('booking_date', { ascending: false }).order('start_time', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching bookings from Supabase:', error);
      return [];
    }

    return (data || []).map((row) => this.mapRowToBooking(row));
  }

  async updateBookingStatus(
    id: string,
    status: BookingStatus,
    cancellationReason?: string
  ): Promise<Booking | null> {
    const updatePayload: Record<string, any> = {
      booking_status: status,
      updated_at: new Date().toISOString(),
      synced_to_sheets: false,
    };
    if (cancellationReason) {
      updatePayload.cancellation_reason = cancellationReason;
    }

    const { data, error } = await this.client
      .from('bookings')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return this.mapRowToBooking(data);
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Booking | null> {
    const { data, error } = await this.client
      .from('bookings')
      .update({
        payment_status: status,
        updated_at: new Date().toISOString(),
        synced_to_sheets: false,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return this.mapRowToBooking(data);
  }

  async markSyncedToSheets(id: string, success: boolean): Promise<void> {
    await this.client
      .from('bookings')
      .update({
        synced_to_sheets: success,
        synced_at: success ? new Date().toISOString() : null,
      })
      .eq('id', id);
  }

  async getUnsyncedBookings(): Promise<Booking[]> {
    const { data, error } = await this.client
      .from('bookings')
      .select('*')
      .eq('synced_to_sheets', false);

    if (error) return [];
    return (data || []).map((row) => this.mapRowToBooking(row));
  }

  async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const bookings = await this.getAllBookings();
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

    const expectedRevenue = bookings
      .filter((b) => ['confirmed', 'completed'].includes(b.booking_status))
      .reduce((sum, b) => sum + (b.amount || 249), 0);

    const collectedRevenue = bookings
      .filter((b) => b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.amount || 249), 0);

    const unsyncedCount = bookings.filter((b) => !b.synced_to_sheets).length;

    const webhookUrl =
      (await this.getSetting('google_sheet_webhook_url')) ||
      process.env.GOOGLE_SHEET_WEBHOOK_URL ||
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
    if (!globalThis.__RECHARGE_ROOM_SETTINGS__) {
      globalThis.__RECHARGE_ROOM_SETTINGS__ = {};
    }
    return globalThis.__RECHARGE_ROOM_SETTINGS__[key] || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    if (!globalThis.__RECHARGE_ROOM_SETTINGS__) {
      globalThis.__RECHARGE_ROOM_SETTINGS__ = {};
    }
    globalThis.__RECHARGE_ROOM_SETTINGS__[key] = value;
  }

  private mapRowToBooking(row: any): Booking {
    return {
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      booking_date: row.booking_date,
      start_time: typeof row.start_time === 'string' ? row.start_time.substring(0, 5) : row.start_time,
      end_time: typeof row.end_time === 'string' ? row.end_time.substring(0, 5) : row.end_time,
      duration_minutes: row.duration_minutes || 15,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      customer_phone: row.customer_phone,
      customer_type: row.customer_type,
      organization_unit: row.organization_unit,
      notes: row.notes || undefined,
      booking_status: row.booking_status,
      payment_status: row.payment_status,
      amount: Number(row.amount) || 249,
      cancellation_reason: row.cancellation_reason || undefined,
      synced_to_sheets: Boolean(row.synced_to_sheets),
      synced_at: row.synced_at,
    };
  }
}
