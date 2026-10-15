import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';
import { generateSlotsForDate, getCurrentDateIST, isOperatingDate } from '@/lib/utils';

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

    const repo = getRepository();
    const bookedTimes = await repo.getBookedSlots(dateStr);
    const slots = generateSlotsForDate(dateStr, bookedTimes);

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
    return NextResponse.json({ error: 'Failed to retrieve slot availability.' }, { status: 500 });
  }
}
