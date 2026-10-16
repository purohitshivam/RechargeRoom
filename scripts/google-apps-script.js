/**
 * ==============================================================================
 * Recharge Room — Google Apps Script for Instant Sheet Sync
 * ==============================================================================
 * 
 * Setup Instructions (Takes 60 seconds):
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1jsla1KjhwcmCRdFURifSEa2_Eo3kYPpyBssie97K9qE/edit
 * 2. In the top menu, click Extensions > Apps Script.
 * 3. Delete any default code in Code.gs, paste this entire file, and click Save (Floppy disk icon).
 * 4. Click the blue Deploy button (top right) > New deployment.
 * 5. Click the gear icon next to "Select type" > Web app.
 * 6. Set Description: "Recharge Room Webhook".
 * 7. Set Execute as: "Me" (your Google account).
 * 8. Set Who has access: "Anyone" (crucial so bookings can be posted without login).
 * 9. Click Deploy, Authorize access with your Google account.
 * 10. Copy the Web app URL (starts with https://script.google.com/macros/s/... and ends in /exec).
 * 11. Open your Recharge Room Admin (/admin) > Google Sheets Setup, paste the URL and click "Save & Test Connection".
 *     (Or add GOOGLE_SHEET_WEBHOOK_URL in your Vercel Project Settings > Environment Variables).
 * 
 * Done! Every booking will now instantly appear in your Google Sheet!
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    service: 'Recharge Room Google Sheets Sync',
    message: 'Google Apps Script webhook is active and ready to receive bookings.',
    sheetName: SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName(),
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 1. Ensure header row exists and contains Coupon Code
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
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
        'Last Updated At'
      ]);
      // Format headers
      var headerRange = sheet.getRange(1, 1, 1, 17);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#F3F4F6');
      sheet.setFrozenRows(1);
    } else {
      // Ensure existing sheet has Coupon Code column header
      var lastCol = sheet.getLastColumn();
      var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      var hasCoupon = false;
      for (var h = 0; h < headers.length; h++) {
        if (headers[h] && headers[h].toString().toLowerCase().includes('coupon')) {
          hasCoupon = true;
          break;
        }
      }
      if (!hasCoupon) {
        var newCol = lastCol + 1;
        var headerCell = sheet.getRange(1, newCol);
        headerCell.setValue('Coupon Code');
        headerCell.setFontWeight('bold');
        headerCell.setBackground('#F3F4F6');
      }
    }

    // 2. Handle connection test ping
    if (data.is_test || data.action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        is_test: true,
        message: 'Recharge Room webhook test verified successfully.',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Check if booking ID already exists to update
    var bookingId = data.id;
    var lastRow = sheet.getLastRow();
    var rowIndexToUpdate = -1;

    if (lastRow > 1) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] === bookingId) {
          rowIndexToUpdate = i + 2; // 1-indexed, skipping header
          break;
        }
      }
    }

    var rowValues = [
      data.id,
      data.created_at,
      data.booking_date,
      data.start_time,
      data.end_time,
      data.duration_minutes || 15,
      data.customer_name,
      data.customer_phone,
      data.customer_email || '',
      data.customer_type || 'student',
      data.organization_unit || '',
      data.notes || '',
      (data.booking_status || 'confirmed').toUpperCase(),
      (data.payment_status || 'pending').toUpperCase(),
      (typeof data.amount !== 'undefined' && data.amount !== null && data.amount !== '') ? data.amount : 249,
      data.coupon_code || 'NONE',
      data.updated_at || new Date().toISOString()
    ];

    if (rowIndexToUpdate > 0) {
      sheet.getRange(rowIndexToUpdate, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      id: bookingId,
      action: rowIndexToUpdate > 0 ? 'updated' : 'inserted',
      row: rowIndexToUpdate > 0 ? rowIndexToUpdate : sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
