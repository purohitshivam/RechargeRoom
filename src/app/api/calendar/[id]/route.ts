import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';
import { generateIcsContent } from '@/lib/calendar';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const repo = getRepository();
    const booking = await repo.getBookingById(id);

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 });
    }

    const icsContent = generateIcsContent(booking);

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${booking.id}.ics"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('Error serving ICS calendar file:', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
