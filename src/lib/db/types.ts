import { Booking, BookingStatus, CreateBookingInput, PaymentStatus, AdminDashboardMetrics } from '@/types';

export interface BookingFilters {
  date?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
}

export interface BookingRepository {
  getBookedSlots(dateStr: string): Promise<string[]>;
  createBooking(input: CreateBookingInput): Promise<{
    success: boolean;
    booking?: Booking;
    error?: string;
  }>;
  getBookingById(id: string): Promise<Booking | null>;
  getAllBookings(filters?: BookingFilters): Promise<Booking[]>;
  updateBookingStatus(
    id: string,
    status: BookingStatus,
    cancellationReason?: string
  ): Promise<Booking | null>;
  updatePaymentStatus(id: string, status: PaymentStatus): Promise<Booking | null>;
  markSyncedToSheets(id: string, success: boolean): Promise<void>;
  getUnsyncedBookings(): Promise<Booking[]>;
  getDashboardMetrics(): Promise<AdminDashboardMetrics>;
}
