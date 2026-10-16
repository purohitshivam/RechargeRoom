import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';
import { isAuthenticatedAdmin } from '@/lib/auth';

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: NextRequest) {
  const isAuth = await isAuthenticatedAdmin(request);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const repo = getRepository();
  const bookings = await repo.getAllBookings();

  const headers = [
    'Booking ID',
    'Created At',
    'Booking Date',
    'Start Time',
    'End Time',
    'Duration (mins)',
    'Customer Name',
    'Mobile Number',
    'Email Address',
    'Customer Type',
    'College/Company/Dept',
    'Customer Note',
    'Booking Status',
    'Payment Status',
    'Amount (INR)',
    'Coupon Code',
    'Synced to Sheets',
    'Last Updated At',
  ];

  const rows = bookings.map((b) => [
    escapeCsvCell(b.id),
    escapeCsvCell(b.created_at),
    escapeCsvCell(b.booking_date),
    escapeCsvCell(b.start_time),
    escapeCsvCell(b.end_time),
    escapeCsvCell(b.duration_minutes),
    escapeCsvCell(b.customer_name),
    escapeCsvCell(b.customer_phone),
    escapeCsvCell(b.customer_email || ''),
    escapeCsvCell(b.customer_type),
    escapeCsvCell(b.organization_unit || ''),
    escapeCsvCell(b.notes || ''),
    escapeCsvCell(b.booking_status),
    escapeCsvCell(b.payment_status),
    escapeCsvCell(b.amount),
    escapeCsvCell(b.coupon_code || 'NONE'),
    escapeCsvCell(b.synced_to_sheets ? 'Yes' : 'No'),
    escapeCsvCell(b.updated_at),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="recharge-room-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
