import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';
import { CreateBookingInput, CustomerType } from '@/types';
import { syncBookingToSheets, fetchLiveBookedSlotsFromGoogleSheet } from '@/lib/sheets';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { BUSINESS_CONFIG } from '@/config/business';

function validateMobileNumber(phone: string): boolean {
  // Cleans out spaces, dashes, +91 prefix
  const cleaned = phone.replace(/[\s\-()]/g, '').replace(/^(\+91|91)/, '');
  // Standard Indian 10-digit mobile number starting with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(cleaned);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      booking_date,
      start_time,
      customer_name,
      customer_email,
      customer_phone,
      customer_type,
      organization_unit,
      notes,
      coupon_code,
    } = body;

    // 1. Validation
    if (!booking_date || !/^\d{4}-\d{2}-\d{2}$/.test(booking_date)) {
      return NextResponse.json({ error: 'Please choose a valid booking date.' }, { status: 400 });
    }

    if ((BUSINESS_CONFIG.fullyBookedDates || []).includes(booking_date)) {
      return NextResponse.json(
        { error: 'All slots for this date are fully reserved. Please choose another date.' },
        { status: 409 }
      );
    }

    if (!start_time || !/^\d{2}:\d{2}$/.test(start_time)) {
      return NextResponse.json({ error: 'Please select a valid 15-minute time slot.' }, { status: 400 });
    }

    if (!customer_name || customer_name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter your full name (at least 2 characters).' }, { status: 400 });
    }

    if (!customer_phone || !validateMobileNumber(customer_phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const emailTrimmed = customer_email ? customer_email.trim().toLowerCase() : '';
    if (emailTrimmed && !validateEmail(emailTrimmed)) {
      return NextResponse.json({ error: 'Please enter a valid email address or leave it blank.' }, { status: 400 });
    }

    if (!['student', 'employee'].includes(customer_type)) {
      return NextResponse.json(
        { error: 'Please select whether you are a Student or Employee.' },
        { status: 400 }
      );
    }

    // Coupon Code Validation (strictly RRMU50 or RRMUFREE)
    let validCouponCode: string | undefined = undefined;
    let discountAmount = 0;
    if (coupon_code && typeof coupon_code === 'string' && coupon_code.trim().length > 0) {
      const cleanCoupon = coupon_code.trim().toUpperCase();
      if (cleanCoupon === 'RRMUFREE') {
        validCouponCode = 'RRMUFREE';
        discountAmount = 249;
      } else if (cleanCoupon === 'RRMU50') {
        validCouponCode = 'RRMU50';
        discountAmount = 50;
      } else {
        return NextResponse.json(
          { error: "Invalid coupon code. Only 'RRMU50' and 'RRMUFREE' are accepted." },
          { status: 400 }
        );
      }
    }

    // Double-booking collision check against live Google Sheet
    try {
      const sheetBookedSlots = await fetchLiveBookedSlotsFromGoogleSheet(booking_date);
      if (sheetBookedSlots.includes(start_time)) {
        return NextResponse.json(
          { error: 'This 15-minute slot was just booked by another customer. Please choose a different time.' },
          { status: 409 }
        );
      }
    } catch (checkErr) {
      console.warn('[Collision Check Notice] Google Sheet check bypassed:', checkErr);
    }

    const input: CreateBookingInput = {
      booking_date,
      start_time,
      customer_name: customer_name.trim(),
      customer_email: emailTrimmed,
      customer_phone: customer_phone.trim(),
      customer_type: customer_type as CustomerType,
      organization_unit: organization_unit?.trim() || '',
      notes: notes?.trim() || undefined,
      coupon_code: validCouponCode,
      discount_amount: discountAmount > 0 ? discountAmount : undefined,
    };

    const repo = getRepository();
    const result = await repo.createBooking(input);

    if (!result.success || !result.booking) {
      const isConflict =
        result.error?.includes('already been reserved') ||
        result.error?.includes('just booked') ||
        result.error?.includes('concurrently');

      return NextResponse.json(
        { error: result.error || 'Failed to create reservation.' },
        { status: isConflict ? 409 : 400 }
      );
    }

    const booking = result.booking;

    // Await Google Sheets sync so serverless lambda does not freeze before HTTP request completes
    let sheetsSyncResult: { success: boolean; message?: string; error?: string } | undefined;
    try {
      sheetsSyncResult = await syncBookingToSheets(booking);
      console.log(`[Sheets Sync for ${booking.id}]:`, sheetsSyncResult);
    } catch (err: any) {
      console.error(`[Sheets Sync Error for ${booking.id}]:`, err);
      sheetsSyncResult = {
        success: false,
        error: err?.message || 'Sync encountered unexpected error.',
      };
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your 15-minute reset is confirmed.',
        booking,
        sheets_sync: sheetsSyncResult,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Only authenticated admins can read all bookings
  const isAuth = await isAuthenticatedAdmin(request);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const paymentStatus = (searchParams.get('paymentStatus') as any) || undefined;
    const search = searchParams.get('search') || undefined;

    const repo = getRepository();
    const bookings = await repo.getAllBookings({ date, status, paymentStatus, search });
    const metrics = await repo.getDashboardMetrics();

    return NextResponse.json({ bookings, metrics });
  } catch (error: any) {
    console.error('Error retrieving bookings:', error);
    return NextResponse.json({ error: 'Failed to retrieve bookings.' }, { status: 500 });
  }
}
