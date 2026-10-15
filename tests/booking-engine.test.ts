import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

import {
  timeToMinutes,
  minutesToTime,
  addMinutesToTime,
  generateSlotsForDate,
  generateBookingId,
} from '../src/lib/utils';
import { LocalBookingRepository } from '../src/lib/db/local';
import { generateIcsContent } from '../src/lib/calendar';
import { Booking, CustomerType } from '../src/types';

// Reset local test db before tests run
before(() => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbFile = path.join(dataDir, 'local-db.json');
  fs.writeFileSync(dbFile, JSON.stringify({ bookings: [] }, null, 2), 'utf-8');
});

test('timeToMinutes & minutesToTime converts accurately', () => {
  assert.equal(timeToMinutes('12:00'), 720);
  assert.equal(timeToMinutes('13:15'), 795);
  assert.equal(minutesToTime(795), '13:15');
  assert.equal(addMinutesToTime('13:15', 15), '13:30');
});

test('generateSlotsForDate respects operating hours (12 PM - 8 PM) and breaks', () => {
  const futureDate = '2026-11-20'; // Friday (operating day)
  const slots = generateSlotsForDate(futureDate, []);

  assert.ok(slots.length > 0, 'Should generate slots');
  assert.equal(slots[0].time, '12:00', 'First slot must be 12:00 PM');
  assert.equal(slots[slots.length - 1].time, '19:45', 'Last 15-min slot is 19:45 (till 20:00)');

  // Verify break 1 (14:30 - 15:00) is marked as unavailable
  const break1Slot = slots.find((s) => s.time === '14:30');
  assert.ok(break1Slot, 'Slot 14:30 should exist');
  assert.equal(break1Slot.available, false, 'Break slot 14:30 must be unavailable');
  assert.equal(break1Slot.reason, 'break');

  const break1Slot2 = slots.find((s) => s.time === '14:45');
  assert.ok(break1Slot2, 'Slot 14:45 should exist');
  assert.equal(break1Slot2.available, false, 'Break slot 14:45 must be unavailable');

  // Verify break 2 (17:30 - 18:00) is marked as unavailable
  const break2Slot = slots.find((s) => s.time === '17:30');
  assert.ok(break2Slot, 'Slot 17:30 should exist');
  assert.equal(break2Slot.available, false, 'Break slot 17:30 must be unavailable');
  assert.equal(break2Slot.reason, 'break');
});

test('generateSlotsForDate marks booked slots as unavailable', () => {
  const futureDate = '2026-11-20';
  const booked = ['13:15'];
  const slots = generateSlotsForDate(futureDate, booked);

  const targetSlot = slots.find((s) => s.time === '13:15');
  assert.ok(targetSlot);
  assert.equal(targetSlot.available, false);
  assert.equal(targetSlot.reason, 'booked');

  const adjacentSlot = slots.find((s) => s.time === '13:30');
  assert.ok(adjacentSlot);
  assert.equal(adjacentSlot.available, true);
});

test('generateBookingId produces clean unambiguous references', () => {
  const id1 = generateBookingId('2026-10-15');
  const id2 = generateBookingId('2026-10-15');

  assert.match(id1, /^RR-20261015-[A-Z0-9]{4}$/);
  assert.notEqual(id1, id2);
});

test('LocalBookingRepository prevents concurrent double-booking', async () => {
  const repo = new LocalBookingRepository();
  const testDate = '2026-11-20';
  const testTime = '13:15';

  // Simulate 5 simultaneous requests for the exact same slot
  const attempts = Array.from({ length: 5 }, (_, i) =>
    repo.createBooking({
      booking_date: testDate,
      start_time: testTime,
      customer_name: `Customer ${i + 1}`,
      customer_email: `customer${i + 1}@mu.edu`,
      customer_phone: '9876543210',
      customer_type: 'student',
      organization_unit: 'Engineering',
      notes: `Concurrent attempt ${i + 1}`,
    })
  );

  const results = await Promise.all(attempts);

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  assert.equal(successCount, 1, 'Exactly ONE booking should succeed');
  assert.equal(failureCount, 4, 'Remaining 4 concurrent bookings must be rejected');

  const winner = results.find((r) => r.success);
  assert.ok(winner?.booking);
  assert.equal(winner.booking.start_time, testTime);

  // Verify that an immediate 6th attempt also fails
  const attempt6 = await repo.createBooking({
    booking_date: testDate,
    start_time: testTime,
    customer_name: 'Customer 6',
    customer_email: 'customer6@mu.edu',
    customer_phone: '9876543210',
    customer_type: 'employee',
    organization_unit: 'Faculty',
  });
  assert.equal(attempt6.success, false);
  assert.match(attempt6.error || '', /already been reserved|just booked/);

  // Cancellation releases the slot
  await repo.updateBookingStatus(winner.booking.id, 'cancelled');

  // Verify slot can now be booked again
  const retryAfterCancel = await repo.createBooking({
    booking_date: testDate,
    start_time: testTime,
    customer_name: 'Customer New',
    customer_email: 'new@mu.edu',
    customer_phone: '9876543210',
    customer_type: 'student',
    organization_unit: 'Arts',
  });
  assert.equal(retryAfterCancel.success, true, 'Slot should be available after cancellation');
});

test('Collected revenue counts only bookings with payment_status == paid', async () => {
  const repo = new LocalBookingRepository();
  const testDate = '2026-11-20';

  // Book slot 15:30 and keep pending
  await repo.createBooking({
    booking_date: testDate,
    start_time: '15:30',
    customer_name: 'Pending Customer',
    customer_email: 'pending@mu.edu',
    customer_phone: '9876543210',
    customer_type: 'student',
    organization_unit: 'Dept A',
  });

  // Book slot 15:45 and mark paid
  const b2 = await repo.createBooking({
    booking_date: testDate,
    start_time: '15:45',
    customer_name: 'Paid Customer',
    customer_email: 'paid@mu.edu',
    customer_phone: '9876543210',
    customer_type: 'employee',
    organization_unit: 'Dept B',
  });
  assert.ok(b2.booking);
  await repo.updatePaymentStatus(b2.booking.id, 'paid');

  const metrics = await repo.getDashboardMetrics();
  assert.ok(metrics.collectedRevenue >= 249, 'Collected revenue should include paid booking');
  assert.ok(metrics.expectedRevenue >= metrics.collectedRevenue, 'Expected revenue >= collected');
});

test('generateIcsContent produces valid standard calendar invite', () => {
  const mockBooking: Booking = {
    id: 'RR-20261015-8K2D',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    booking_date: '2026-10-15',
    start_time: '12:00',
    end_time: '12:15',
    duration_minutes: 15,
    customer_name: 'Aarav Sharma',
    customer_email: 'aarav@mu.edu',
    customer_phone: '9876543210',
    customer_type: 'student' as CustomerType,
    organization_unit: 'Engineering',
    booking_status: 'confirmed',
    payment_status: 'pending',
    amount: 249,
    synced_to_sheets: false,
  };

  const ics = generateIcsContent(mockBooking);
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('BEGIN:VEVENT'));
  assert.ok(ics.includes('UID:RR-20261015-8K2D@rechargeroom.co.in'));
  assert.ok(ics.includes('SUMMARY:Recharge Room - 15-Minute Reset'));
  assert.ok(ics.includes('STATUS:CONFIRMED'));
  assert.ok(ics.includes('Capital Building, 11th Floor'));
  assert.ok(ics.includes('END:VEVENT'));
  assert.ok(ics.includes('END:VCALENDAR'));
});
