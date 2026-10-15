-- ==============================================================================
-- Recharge Room - Database Schema & Concurrency-Safe Booking Engine
-- ==============================================================================

-- Create enum or check constraints for statuses
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('student', 'employee')),
  organization_unit TEXT NOT NULL,
  notes TEXT,
  booking_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  amount NUMERIC(10, 2) NOT NULL DEFAULT 249.00,
  cancellation_reason TEXT,
  synced_to_sheets BOOLEAN NOT NULL DEFAULT false,
  synced_at TIMESTAMPTZ
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_sync ON bookings (synced_to_sheets) WHERE synced_to_sheets = false;

-- CRITICAL CONCURRENCY PROTECTION:
-- Partial unique index guarantees that NO TWO customers can reserve the same slot.
-- If a booking is cancelled, the slot is instantly freed for subsequent bookings.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_slot
ON bookings (booking_date, start_time)
WHERE booking_status != 'cancelled';

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Atomic Booking Creation RPC function
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_id TEXT,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_duration_minutes INT,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_customer_type TEXT,
  p_organization_unit TEXT,
  p_notes TEXT,
  p_amount NUMERIC
)
RETURNS JSON AS $$
DECLARE
  v_conflict_count INT;
  v_new_booking RECORD;
BEGIN
  -- 1. Check for any non-cancelled conflicting reservation
  SELECT COUNT(*) INTO v_conflict_count
  FROM bookings
  WHERE booking_date = p_booking_date
    AND start_time = p_start_time
    AND booking_status != 'cancelled';

  IF v_conflict_count > 0 THEN
    RETURN json_build_object(
      'success', false,
      'code', 'SLOT_ALREADY_BOOKED',
      'message', 'This 15-minute slot has already been reserved. Please pick another time.'
    );
  END IF;

  -- 2. Insert atomically
  INSERT INTO bookings (
    id,
    booking_date,
    start_time,
    end_time,
    duration_minutes,
    customer_name,
    customer_email,
    customer_phone,
    customer_type,
    organization_unit,
    notes,
    amount,
    booking_status,
    payment_status,
    synced_to_sheets
  ) VALUES (
    p_id,
    p_booking_date,
    p_start_time,
    p_end_time,
    p_duration_minutes,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_customer_type,
    p_organization_unit,
    p_notes,
    p_amount,
    'confirmed',
    'pending',
    false
  )
  RETURNING * INTO v_new_booking;

  RETURN json_build_object(
    'success', true,
    'booking', row_to_json(v_new_booking)
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'code', 'SLOT_ALREADY_BOOKED',
      'message', 'Slot was reserved concurrently by another customer. Please pick another time.'
    );
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Anonymous users cannot read the entire customer list (privacy protection)
DROP POLICY IF EXISTS "Deny public select" ON bookings;
CREATE POLICY "Deny public select" ON bookings
FOR SELECT
TO anon
USING (false);

-- Service role bypasses RLS for server-side API operations
-- (Next.js server API routes use SUPABASE_SERVICE_ROLE_KEY to safely manage bookings)
