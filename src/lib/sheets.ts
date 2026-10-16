import { google } from 'googleapis';
import { Booking } from '@/types';
import { getRepository } from '@/lib/db';
import { CONTACT_CONFIG } from '@/config/business';

const SHEET_NAME = 'Recharge Room Bookings';
const DEFAULT_SHEET_ID = CONTACT_CONFIG.defaultSheetId;
const HEADERS = [
  'Booking ID',
  'Created At',
  'Booking Date',
  'Start Time',
  'End Time',
  'Duration (Mins)',
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
  'Last Updated At',
];

export async function getEffectiveWebhookUrl(): Promise<string | null> {
  // 1. Authoritative verified webhook URL for Recharge Room
  if (CONTACT_CONFIG.defaultWebhookUrl && CONTACT_CONFIG.defaultWebhookUrl.trim().length > 0) {
    return CONTACT_CONFIG.defaultWebhookUrl.trim();
  }

  // 2. Custom setting override from admin
  try {
    const repo = getRepository();
    const custom = await repo.getSetting('google_sheet_webhook_url');
    if (custom && custom.trim().length > 0) {
      return custom.trim();
    }
  } catch (_) {}

  // 3. Environment variable fallback
  const envUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  return null;
}

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    return null;
  }

  // Handle potential escaped newline sequences in environment variables
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, sheetId };
}

/**
 * Ensures the target sheet and its header row exist.
 */
async function ensureSheetAndHeaders(sheets: any, sheetId: string): Promise<string> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheetList = meta.data.sheets || [];
  
  let targetTab = SHEET_NAME;
  const exists = sheetList.some((s: any) => s.properties?.title === SHEET_NAME);

  if (!exists) {
    if (sheetList.length > 0 && sheetList[0].properties?.title) {
      targetTab = sheetList[0].properties.title;
    }
  }

  const headerCheck = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${targetTab}'!A1:Q1`,
  });

  const existingHeaders = headerCheck.data.values;
  if (!existingHeaders || existingHeaders.length === 0 || existingHeaders[0].length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'${targetTab}'!A1:Q1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [HEADERS],
      },
    });
  }

  return targetTab;
}

function mapBookingToRow(b: Booking): any[] {
  return [
    b.id,
    b.created_at,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.duration_minutes,
    b.customer_name,
    b.customer_phone,
    b.customer_email || '',
    b.customer_type,
    b.organization_unit || '',
    b.notes || '',
    b.booking_status.toUpperCase(),
    b.payment_status.toUpperCase(),
    b.amount,
    b.coupon_code || 'NONE',
    b.updated_at,
  ];
}

/**
 * Validates a Google Apps Script Web App URL.
 */
export function validateWebhookUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Webhook URL cannot be empty.' };
  }
  const clean = url.trim();
  if (!clean.startsWith('https://script.google.com/')) {
    return { valid: false, error: 'URL must start with https://script.google.com/' };
  }
  if (clean.includes('/edit')) {
    return {
      valid: false,
      error: 'You pasted the script editor link ending in /edit. Please click Deploy > New deployment to get the Web App URL (ends in /exec).',
    };
  }
  if (clean.endsWith('/dev')) {
    return {
      valid: false,
      error: 'You pasted the /dev link which requires developer login. Please use the Web App deployment link ending in /exec.',
    };
  }
  return { valid: true };
}

/**
 * Idempotently syncs a single booking to Google Sheets.
 * Supports both direct Webhook URL (instant 0-credential setup)
 * and Google Cloud Service Account API.
 */
export async function syncBookingToSheets(booking: Booking): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const repo = getRepository();

  // 1. Try Google Apps Script Webhook if configured (Fastest, zero-credential setup)
  const webhookUrl = await getEffectiveWebhookUrl();
  if (webhookUrl) {
    const validation = validateWebhookUrl(webhookUrl);
    if (!validation.valid) {
      console.warn(`[Sheets Sync Validation]: ${validation.error}`);
      return { success: false, error: validation.error };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Prepare payload with explicit coupon code and note redundancy
      const payload = {
        ...booking,
        coupon_code: booking.coupon_code || 'NONE',
        notes: booking.notes
          ? `${booking.notes} ${booking.coupon_code ? `[Coupon: ${booking.coupon_code}]` : ''}`.trim()
          : (booking.coupon_code ? `Coupon: ${booking.coupon_code}` : ''),
      };

      // Google Apps Script requires browser-like headers to prevent 401 on datacenter IPs.
      // Additionally, Google Apps Script returns 302 Found when doPost(e) has executed.
      // Setting redirect: 'manual' prevents Node fetch from transforming the POST into a GET on redirect.
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': '*/*',
        },
        body: JSON.stringify(payload),
        redirect: 'manual',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Status 302/301 from script.google.com indicates doPost() completed and Google is redirecting to output.
      if (res.status === 302 || res.status === 301) {
        const redirectUrl = res.headers.get('location');
        let followedJson: any = null;
        if (redirectUrl) {
          try {
            const followRes = await fetch(redirectUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              },
            });
            if (followRes.ok) {
              const text = await followRes.text();
              try {
                followedJson = JSON.parse(text);
              } catch (_) {}
            }
          } catch (_) {}
        }

        await repo.markSyncedToSheets(booking.id, true);
        invalidateSheetCache();
        return {
          success: true,
          message: `Synced to Google Sheet via webhook (${followedJson?.action || 'saved'} row ${followedJson?.row || ''}).`,
        };
      }

      const resText = await res.text();
      let resJson: any = null;
      try {
        resJson = JSON.parse(resText);
      } catch (_) {}

      if (resText.includes('accounts.google.com') || resText.includes('ServiceLogin')) {
        const errorMsg = 'Google Apps Script requires login. In Apps Script, set "Who has access" to "Anyone" and redeploy.';
        console.warn(`[Sheets Webhook Error]: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }

      if (res.ok && resJson?.success !== false) {
        await repo.markSyncedToSheets(booking.id, true);
        invalidateSheetCache();
        return {
          success: true,
          message: `Synced to Google Sheet via webhook (${resJson?.action || 'saved'} row ${resJson?.row || ''}).`,
        };
      } else {
        const errorMsg = resJson?.error || `Webhook responded with HTTP ${res.status}`;
        console.warn(`[Sheets Webhook Sync Notice]:`, errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      const msg = isTimeout ? 'Webhook request timed out after 15s.' : err?.message || 'Network error reaching webhook.';
      console.warn('[Google Sheet Webhook Sync Notice]:', msg);
      return { success: false, error: msg };
    }
  }

  // 2. Try Google Cloud Service Account API
  const client = getSheetsClient();
  if (!client) {
    return {
      success: false,
      error: 'Google Sheets sync pending. Please configure the Google Apps Script Webhook URL in Admin or set GOOGLE_SHEET_WEBHOOK_URL.',
    };
  }

  try {
    const { sheets, sheetId } = client;
    const tabName = await ensureSheetAndHeaders(sheets, sheetId);

    const colAResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${tabName}'!A:A`,
    });

    const rows = colAResponse.data.values || [];
    let existingRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === booking.id) {
        existingRowIndex = i + 1;
        break;
      }
    }

    const rowData = mapBookingToRow(booking);

    if (existingRowIndex > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${tabName}'!A${existingRowIndex}:Q${existingRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      });
      await repo.markSyncedToSheets(booking.id, true);
      invalidateSheetCache();
      return { success: true, message: `Updated row ${existingRowIndex} in Google Sheet.` };
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `'${tabName}'!A:Q`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData],
        },
      });
      await repo.markSyncedToSheets(booking.id, true);
      invalidateSheetCache();
      return { success: true, message: 'Appended new booking row to Google Sheet.' };
    }
  } catch (err: any) {
    console.error(`[Google Sheets API Sync Error for ${booking.id}]:`, err?.message || err);
    await repo.markSyncedToSheets(booking.id, false);
    return {
      success: false,
      error: err?.message || 'Failed to sync with Google Sheets API',
    };
  }
}

/**
 * Diagnostic tool to test connection to Google Sheets.
 */
export async function testSheetsConnection(): Promise<{
  success: boolean;
  message: string;
  method: 'webhook' | 'service_account' | 'none';
  details?: any;
}> {
  const webhookUrl = await getEffectiveWebhookUrl();
  if (webhookUrl) {
    const validation = validateWebhookUrl(webhookUrl);
    if (!validation.valid) {
      return {
        success: false,
        method: 'webhook',
        message: validation.error || 'Invalid webhook URL',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': '*/*',
        },
        body: JSON.stringify({
          action: 'ping',
          is_test: true,
          id: `TEST-${Date.now().toString().slice(-6)}`,
          customer_name: 'Test Ping',
        }),
        redirect: 'manual',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Status 302 or 301 from script.google.com confirms the doPost webhook executed
      if (res.status === 302 || res.status === 301) {
        return {
          success: true,
          method: 'webhook',
          message: 'Google Apps Script Webhook is live and responding perfectly!',
        };
      }

      const resText = await res.text();
      let resJson: any = null;
      try {
        resJson = JSON.parse(resText);
      } catch (_) {}

      if (resText.includes('accounts.google.com') || resText.includes('ServiceLogin')) {
        return {
          success: false,
          method: 'webhook',
          message: 'Google login required. Please re-deploy your Apps Script with "Who has access: Anyone".',
        };
      }

      if (res.ok && resJson?.success !== false) {
        return {
          success: true,
          method: 'webhook',
          message: 'Google Apps Script Webhook is live and responding perfectly!',
          details: resJson,
        };
      }

      return {
        success: false,
        method: 'webhook',
        message: resJson?.error || `Webhook responded with HTTP status ${res.status}: ${resText.slice(0, 100)}`,
      };
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      return {
        success: false,
        method: 'webhook',
        message: isTimeout
          ? 'Webhook test timed out after 15s. Check network or Apps Script deployment.'
          : err?.message || 'Failed to connect to webhook URL.',
      };
    }
  }

  const client = getSheetsClient();
  if (client) {
    try {
      const { sheets, sheetId } = client;
      const tabName = await ensureSheetAndHeaders(sheets, sheetId);
      return {
        success: true,
        method: 'service_account',
        message: `Successfully connected to Google Sheet (Tab: "${tabName}").`,
      };
    } catch (err: any) {
      return {
        success: false,
        method: 'service_account',
        message: `Service Account API error: ${err?.message || err}`,
      };
    }
  }

  return {
    success: false,
    method: 'none',
    message: 'No Google Sheets connection is configured yet. Follow the 60-second Apps Script setup.',
  };
}

/**
 * Reconciles all pending/unsynced bookings.
 */
export async function syncAllPendingBookings(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  errors: string[];
}> {
  const repo = getRepository();
  const unsynced = await repo.getUnsyncedBookings();
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const booking of unsynced) {
    const res = await syncBookingToSheets(booking);
    if (res.success) {
      succeeded++;
    } else {
      failed++;
      if (res.error) errors.push(`${booking.id}: ${res.error}`);
    }
  }

  return {
    total: unsynced.length,
    succeeded,
    failed,
    errors,
  };
}

// ---------------------------------------------------------------------------
// LIVE GOOGLE SHEET AVAILABILITY SYNCHRONIZATION
// Guarantees zero multi-booking across distributed serverless instances
// ---------------------------------------------------------------------------

interface SheetCache {
  timestamp: number;
  csv: string;
}

let cachedSheetData: SheetCache | null = null;
const CACHE_TTL_MS = 3000; // 3 seconds in-memory cache to prevent Google rate limits

export function invalidateSheetCache() {
  cachedSheetData = null;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Fetches confirmed booked start times for a specific date directly from Google Sheets.
 * This guarantees that across serverless instances and multiple visitors,
 * any slot present in the Google Sheet is immediately unavailable to everyone.
 */
export async function fetchLiveBookedSlotsFromGoogleSheet(dateStr: string): Promise<string[]> {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
    if (!sheetId) return [];

    const now = Date.now();
    let csv = '';

    if (cachedSheetData && now - cachedSheetData.timestamp < CACHE_TTL_MS) {
      csv = cachedSheetData.csv;
    } else {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/csv,*/*',
        },
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[Live Sheet Query] Google Sheets CSV fetch returned HTTP ${res.status}`);
        return [];
      }

      csv = await res.text();
      cachedSheetData = { timestamp: now, csv };
    }

    if (!csv || !csv.includes(',')) {
      return [];
    }

    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
    const dateIdx = headers.findIndex((h) => h.includes('booking date') || h === 'date');
    const timeIdx = headers.findIndex((h) => h.includes('start time') || h === 'time');
    const statusIdx = headers.findIndex((h) => h.includes('booking status') || h === 'status');

    if (dateIdx === -1 || timeIdx === -1) {
      console.warn('[Live Sheet Query] Missing date or time columns in Google Sheet CSV headers:', headers);
      return [];
    }

    const bookedSlots: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length <= Math.max(dateIdx, timeIdx)) continue;

      const rowDate = row[dateIdx]?.replace(/^["']|["']$/g, '').trim();
      const rawTime = row[timeIdx]?.replace(/^["']|["']$/g, '').trim();
      const rowStatus =
        statusIdx !== -1
          ? row[statusIdx]?.replace(/^["']|["']$/g, '').trim().toUpperCase()
          : 'CONFIRMED';

      // Match target date and non-cancelled status
      if (rowDate === dateStr && rowStatus !== 'CANCELLED') {
        // Normalize time to HH:MM (e.g. "12:00:00" -> "12:00", "9:45" -> "09:45")
        const match = rawTime.match(/^(\d{1,2}):(\d{2})/);
        if (match) {
          const hh = match[1].padStart(2, '0');
          const mm = match[2];
          bookedSlots.push(`${hh}:${mm}`);
        }
      }
    }

    return Array.from(new Set(bookedSlots));
  } catch (err: any) {
    console.warn('[Live Sheet Query Notice]: Could not fetch live Google Sheet bookings:', err?.message || err);
    return [];
  }
}
