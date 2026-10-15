import { google } from 'googleapis';
import { Booking } from '@/types';
import { getRepository } from '@/lib/db';

const SHEET_NAME = 'Recharge Room Bookings';
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
  'Last Updated At',
];

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

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
  // 1. Get spreadsheet metadata to check sheet tabs
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheetList = meta.data.sheets || [];
  
  // Use "Recharge Room Bookings" if it exists, otherwise fall back to first sheet's title
  let targetTab = SHEET_NAME;
  const exists = sheetList.some((s: any) => s.properties?.title === SHEET_NAME);

  if (!exists) {
    if (sheetList.length > 0 && sheetList[0].properties?.title) {
      targetTab = sheetList[0].properties.title;
    }
  }

  // 2. Check if headers exist in row 1
  const headerCheck = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${targetTab}'!A1:P1`,
  });

  const existingHeaders = headerCheck.data.values;
  if (!existingHeaders || existingHeaders.length === 0 || existingHeaders[0].length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'${targetTab}'!A1:P1`,
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
    b.customer_email,
    b.customer_type,
    b.organization_unit,
    b.notes || '',
    b.booking_status.toUpperCase(),
    b.payment_status.toUpperCase(),
    b.amount,
    b.updated_at,
  ];
}

/**
 * Idempotently syncs a single booking to Google Sheets.
 * If the booking ID is found in Column A, updates that row.
 * Otherwise, appends a new row at the bottom.
 */
export async function syncBookingToSheets(booking: Booking): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const client = getSheetsClient();
  const repo = getRepository();

  if (!client) {
    return {
      success: false,
      error: 'Google Sheets integration is not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID.',
    };
  }

  try {
    const { sheets, sheetId } = client;
    const tabName = await ensureSheetAndHeaders(sheets, sheetId);

    // Fetch existing Booking IDs in Column A to check for row updates
    const colAResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${tabName}'!A:A`,
    });

    const rows = colAResponse.data.values || [];
    let existingRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === booking.id) {
        existingRowIndex = i + 1; // 1-indexed row number in Sheets
        break;
      }
    }

    const rowData = mapBookingToRow(booking);

    if (existingRowIndex > 0) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${tabName}'!A${existingRowIndex}:P${existingRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      });
      await repo.markSyncedToSheets(booking.id, true);
      return { success: true, message: `Updated row ${existingRowIndex} for booking ${booking.id}` };
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `'${tabName}'!A:P`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData],
        },
      });
      await repo.markSyncedToSheets(booking.id, true);
      return { success: true, message: `Appended new row for booking ${booking.id}` };
    }
  } catch (err: any) {
    console.error(`[Google Sheets Sync Error for ${booking.id}]:`, err?.message || err);
    await repo.markSyncedToSheets(booking.id, false);
    return {
      success: false,
      error: err?.message || 'Failed to sync with Google Sheets API',
    };
  }
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
