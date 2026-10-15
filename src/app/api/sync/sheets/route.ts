import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { syncAllPendingBookings } from '@/lib/sheets';
import { getRepository } from '@/lib/db';

export async function POST(request: NextRequest) {
  const isAuth = await isAuthenticatedAdmin(request);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const result = await syncAllPendingBookings();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error syncing to Google Sheets:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync with Google Sheets.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const isAuth = await isAuthenticatedAdmin(request);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const repo = getRepository();
  const metrics = await repo.getDashboardMetrics();

  return NextResponse.json({
    sheetsSync: metrics.sheetsSync,
  });
}
