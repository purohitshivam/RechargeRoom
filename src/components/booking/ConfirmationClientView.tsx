'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Booking } from '@/types';
import { BUSINESS_CONFIG } from '@/config/business';
import { ConfirmationCard } from '@/components/booking/ConfirmationCard';
import { ArrowLeft, CheckCircle2, MapPin, Clock } from 'lucide-react';

interface ConfirmationClientViewProps {
  id: string;
  initialBooking?: Booking | null;
}

export function ConfirmationClientView({ id, initialBooking }: ConfirmationClientViewProps) {
  const [booking, setBooking] = useState<Booking | null>(initialBooking || null);
  const [loading, setLoading] = useState<boolean>(!initialBooking);

  useEffect(() => {
    if (booking) {
      setLoading(false);
      return;
    }

    // 1. Check browser sessionStorage for client-preserved booking
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(`booking_${id}`) || sessionStorage.getItem('latest_booking');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.id === id || !id)) {
            setBooking(parsed);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not read booking from session storage:', e);
      }
    }

    // 2. Fetch from API
    fetch(`/api/bookings/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.booking) {
          setBooking(data.booking);
        }
      })
      .catch((err) => console.error('Error fetching confirmation booking:', err))
      .finally(() => setLoading(false));
  }, [id, booking]);

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-20">
        <div className="inline-block animate-spin h-6 w-6 border-2 border-neutral-900 border-t-transparent mb-3"></div>
        <p className="font-mono text-xs text-neutral-500 uppercase tracking-wider">
          Loading your reservation details...
        </p>
      </div>
    );
  }

  if (booking) {
    return <ConfirmationCard booking={booking} />;
  }

  // Graceful fallback if booking ID was not found in serverless cache
  return (
    <div className="max-w-xl mx-auto bg-white border border-neutral-200 p-8 sm:p-10 text-center">
      <div className="w-12 h-12 bg-neutral-950 text-white flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-6 h-6 text-white" />
      </div>

      <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 block mb-2">
        Reservation Reference
      </span>
      <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-neutral-950 mb-3">
        You&apos;re Confirmed.
      </h1>

      <div className="my-5 inline-block px-3.5 py-1.5 bg-neutral-100 border border-neutral-200 font-mono text-xs tracking-wider uppercase text-neutral-900 font-semibold">
        Ref: {id}
      </div>

      {/* Prominent Arrival Directions */}
      <div className="my-6 p-5 bg-neutral-100 border border-neutral-200 text-left space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-neutral-900 shrink-0" />
          <span className="font-editorial text-lg text-neutral-950">
            Capital Building, 11th Floor
          </span>
        </div>
        <div className="flex items-start gap-2 pt-1 text-xs text-neutral-700 leading-relaxed font-mono">
          <Clock className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
          <p>
            Please go to <strong>Capital Building, 11th Floor</strong>, 5 minutes before your reserved time. No preparation or changing clothes required.
          </p>
        </div>
      </div>

      <p className="text-xs text-neutral-500 font-mono mb-8">
        Amount Due: ₹249 (Pay in person via UPI or cash after your 15-minute massage).
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/book"
          className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 bg-neutral-950 text-white text-xs font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors"
        >
          Book Another Session
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 border border-neutral-300 text-neutral-800 text-xs font-medium uppercase tracking-wider hover:bg-neutral-50 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
