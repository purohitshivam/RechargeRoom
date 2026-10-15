import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { syncBookingToSheets } from '@/lib/sheets';
import { BookingStatus, PaymentStatus } from '@/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing booking ID.' }, { status: 400 });
    }

    const repo = getRepository();
    const booking = await repo.getBookingById(id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('Error fetching booking by ID:', error);
    return NextResponse.json({ error: 'Failed to retrieve booking.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const isAuth = await isAuthenticatedAdmin(request);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const repo = getRepository();

    let updatedBooking = null;

    if (body.booking_status) {
      const validStatuses: BookingStatus[] = ['confirmed', 'completed', 'cancelled', 'no_show'];
      if (!validStatuses.includes(body.booking_status)) {
        return NextResponse.json({ error: 'Invalid booking status.' }, { status: 400 });
      }
      updatedBooking = await repo.updateBookingStatus(
        id,
        body.booking_status,
        body.cancellation_reason
      );
    }

    if (body.payment_status) {
      const validPaymentStatuses: PaymentStatus[] = ['pending', 'paid', 'refunded'];
      if (!validPaymentStatuses.includes(body.payment_status)) {
        return NextResponse.json({ error: 'Invalid payment status.' }, { status: 400 });
      }
      updatedBooking = await repo.updatePaymentStatus(id, body.payment_status);
    }

    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found or not updated.' }, { status: 404 });
    }

    // Trigger Google Sheets sync in background
    syncBookingToSheets(updatedBooking).catch((err) => {
      console.warn(`[Background Sheets Sync] Failed for ${updatedBooking?.id}:`, err);
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking.' }, { status: 500 });
  }
}
