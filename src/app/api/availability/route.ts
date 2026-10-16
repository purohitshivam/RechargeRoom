import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';
import { generateSlotsForDate, getCurrentDateIST, isOperatingDate } from '@/lib/utils';
import { fetchLiveBookedSlotsFromGoogleSheet } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || getCurrentDateIST();

    // Basic date format validation: YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json({ error: 'Invalid date format. Expected YYYY-MM-DD.' }, { status: 400 });
    }

    const isOperating = isOperatingDate(dateStr);
    if (!isOperating) {
      return NextResponse.json({
        date: dateStr,
        isOperating: false,
        slots: [],
        message: 'Recharge Room is closed on this day.',
      });
    }

    // 1. Local / Database booked slots
    let localBookedTimes: string[] = [];
    try {
      const repo = getRepository();
      localBookedTimes = await repo.getBookedSlots(dateStr);
    } catch (err: any) {
      console.warn('[Availability API] Database query notice:', err?.message || err);
      localBookedTimes = [];
    }

    // 2. Query live Google Sheet so all serverless instances immediately see confirmed reservations
    let sheetBookedTimes: string[] = [];
    try {
      sheetBookedTimes = await fetchLiveBookedSlotsFromGoogleSheet(dateStr);
    } catch (err: any) {
      console.warn('[Availability API] Sheet query notice:', err?.message || err);
      sheetBookedTimes = [];
    }

    // Merge both sources (deduplicated)
    const combinedBookedTimes = Array.from(new Set([...localBookedTimes, ...sheetBookedTimes]));

    const slots = generateSlotsForDate(dateStr, combinedBookedTimes);
    const availableCount = slots.filter((s) => s.available).length;

    return NextResponse.json({
      date: dateStr,
      isOperating: true,
      slots,
      summary: {
        totalSlots: slots.length,
        availableSlots: availableCount,
      },
    });
  } catch (error: any) {
    console.error('Error in availability API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve slot availability.' },
      { status: 500 }
    );
  }
}
