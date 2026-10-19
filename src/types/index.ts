export type BookingStatus = 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type CustomerType = 'student' | 'employee';

export interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string;   // HH:mm (24-hour)
  end_time: string;     // HH:mm (24-hour)
  duration_minutes: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_type: CustomerType;
  organization_unit: string;
  notes?: string;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  amount: number;
  coupon_code?: string;
  discount_amount?: number;
  cancellation_reason?: string;
  synced_to_sheets: boolean;
  synced_at?: string | null;
}

export interface TimeSlot {
  time: string; // HH:mm
  formattedTime: string; // e.g. "11:15 AM"
  endTime: string; // HH:mm
  formattedEndTime: string;
  available: boolean;
  reason?: 'booked' | 'past' | 'break' | 'closed';
}

export interface CreateBookingInput {
  booking_date: string;
  start_time: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_type: CustomerType;
  organization_unit?: string;
  notes?: string;
  coupon_code?: string;
  discount_amount?: number;
}

export interface AdminDashboardMetrics {
  todayConfirmed: number;
  upcomingBookings: number;
  completedSessions: number;
  pendingPayments: number;
  expectedRevenue: number;
  collectedRevenue: number;
  sheetsSync: {
    total: number;
    synced: number;
    pending: number;
    isConfigured: boolean;
    configuredMethod?: 'webhook' | 'service_account' | 'none';
    webhookUrl?: string | null;
    lastSync?: string | null;
  };
}

export interface BusinessConfig {
  brandName: string;
  tagline: string;
  serviceDescription: string;
  durationMinutes: number;
  priceInr: number;
  currencySymbol: string;
  timezone: string;
  operatingDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  operatingHours: {
    open: string;  // "10:00"
    close: string; // "18:00"
  };
  breaks: Array<{
    start: string; // "13:30"
    end: string;   // "14:15"
    label: string;
  }>;
  bookingHorizonDays: number;
  minAdvanceNoticeMinutes: number;
  capacityPerSlot: number;
  locationNote: string;
  paymentNote: string;
  fullyBookedDates?: string[]; // Specific dates where all slots are marked as reserved
}
