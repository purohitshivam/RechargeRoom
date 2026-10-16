import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import {
  syncAllPendingBookings,
  testSheetsConnection,
  getEffectiveWebhookUrl,
  validateWebhookUrl,
} from '@/lib/sheets';
import { getRepository } from '@/lib/db';
import { CONTACT_CONFIG } from '@/config/business';

export async function POST(request: NextRequest) {
  const isAuth = await isAuthenticatedAdmin(request);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (_) {}

    const action = body?.action || 'sync_all';
    const repo = getRepository();

    // 1. Test Connection
    if (action === 'test') {
      const testResult = await testSheetsConnection();
      return NextResponse.json(testResult);
    }

    // 2. Save / Update Webhook URL
    if (action === 'set_webhook') {
      const url = body?.url?.trim();
      if (!url) {
        return NextResponse.json(
          { error: 'Please enter a valid Google Apps Script Webhook URL.' },
          { status: 400 }
        );
      }
      const validation = validateWebhookUrl(url);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      await repo.setSetting('google_sheet_webhook_url', url);

      // Immediately test the newly saved webhook
      const testResult = await testSheetsConnection();
      return NextResponse.json({
        success: true,
        message: 'Google Apps Script Webhook URL saved successfully.',
        test: testResult,
      });
    }

    // 3. Clear Webhook URL
    if (action === 'clear_webhook') {
      await repo.setSetting('google_sheet_webhook_url', '');
      return NextResponse.json({
        success: true,
        message: 'Custom Webhook URL cleared.',
      });
    }

    // 4. Default: Sync all pending/unsynced bookings
    const result = await syncAllPendingBookings();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/sync/sheets:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process sheets request.' },
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
  const effectiveWebhook = await getEffectiveWebhookUrl();

  return NextResponse.json({
    sheetsSync: metrics.sheetsSync,
    webhookUrl: effectiveWebhook || null,
    googleSheetUrl: CONTACT_CONFIG.googleSheetUrl,
    sheetId: CONTACT_CONFIG.defaultSheetId,
  });
}
