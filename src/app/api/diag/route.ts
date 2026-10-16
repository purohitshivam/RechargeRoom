import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = 'https://script.google.com/macros/s/AKfycbzvDNcoAuJamYOiC9WSYJUgAoX6IXjJqk8EGSz3Zy1vhRd2em1zGBajxITh6dXnCxgdFA/exec';
  try {
    // 1. Manual redirect test
    const manualRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'DIAG-MANUAL', customer_name: 'Diag Manual' }),
      redirect: 'manual',
    });

    const manualLocation = manualRes.headers.get('location');
    const manualStatus = manualRes.status;

    // 2. Default follow test
    const defaultRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'DIAG-DEFAULT', customer_name: 'Diag Default' }),
    });
    const defaultStatus = defaultRes.status;
    const defaultText = await defaultRes.text();

    return NextResponse.json({
      envWebhook: process.env.GOOGLE_SHEET_WEBHOOK_URL || null,
      manual: {
        status: manualStatus,
        location: manualLocation,
      },
      default: {
        status: defaultStatus,
        textPreview: defaultText.slice(0, 300),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message });
  }
}
