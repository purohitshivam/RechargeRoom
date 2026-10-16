'use client';

import React from 'react';
import Link from 'next/link';
import { Booking } from '@/types';
import { BUSINESS_CONFIG } from '@/config/business';
import { formatDisplayDate, formatDisplayTime } from '@/lib/utils';
import { generateGoogleCalendarUrl } from '@/lib/calendar';
import { Check, Calendar, Download, ArrowLeft } from 'lucide-react';

interface ConfirmationCardProps {
  booking: Booking;
}

export function ConfirmationCard({ booking }: ConfirmationCardProps) {
  const googleCalUrl = generateGoogleCalendarUrl(booking);

  return (
    <div className="max-w-xl mx-auto bg-white border border-neutral-200 p-6 sm:p-10">
      <div className="text-center pb-8 border-b border-neutral-200">
        <div className="w-12 h-12 bg-neutral-950 text-white flex items-center justify-center mx-auto mb-5">
          <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>

        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 block mb-2">
          Reservation Confirmed
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-neutral-950 mb-3">
          You&apos;re booked.
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 max-w-md mx-auto">
          Your 15-minute reset is officially on the calendar.
        </p>

        <div className="mt-5 inline-block px-3 py-1.5 bg-neutral-100 border border-neutral-200 font-mono text-xs tracking-wider uppercase text-neutral-900">
          Ref: {booking.id}
        </div>
      </div>

      <div className="py-6 border-b border-neutral-200 space-y-3 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-neutral-500">Service</span>
          <span className="font-medium text-neutral-900 text-right">
            15-Min Head, Neck & Shoulder Massage
          </span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-neutral-500">Date</span>
          <span className="font-medium text-neutral-900">
            {formatDisplayDate(booking.booking_date)}
          </span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-neutral-500">Time</span>
          <span className="font-mono font-medium text-neutral-900">
            {formatDisplayTime(booking.start_time)} – {formatDisplayTime(booking.end_time)}
          </span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-neutral-500">Guest</span>
          <span className="font-medium text-neutral-900 text-right">
            {booking.customer_name} ({booking.customer_type === 'student' ? 'Student' : 'Employee'})
          </span>
        </div>

        {booking.coupon_code && (
          <div className="flex justify-between py-1 items-center">
            <span className="text-emerald-700 font-medium">Coupon Applied</span>
            <span className="font-mono text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 border border-emerald-200">
              {booking.coupon_code} (-₹{booking.discount_amount || (booking.coupon_code === 'RRMUFREE' ? 249 : 50)})
            </span>
          </div>
        )}

        <div className="flex justify-between py-1 items-baseline">
          <span className="text-neutral-500">Amount Due</span>
          <span className="font-sans text-xl text-neutral-950 font-bold">
            {booking.amount === 0 ? '₹0 (FREE)' : `${BUSINESS_CONFIG.currencySymbol}${booking.amount}`}
          </span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-neutral-500">Payment Status</span>
          <span className="font-mono text-xs uppercase px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-200">
            {booking.amount === 0 ? 'Complimentary (No Payment Needed)' : 'Pay after your session'}
          </span>
        </div>
      </div>

      {/* Arrival Instructions */}
      <div className="py-6 border-b border-neutral-200">
        <div className="p-4 bg-neutral-100 border border-neutral-200">
          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-neutral-900 block mb-1">
            Where to Go:
          </span>
          <p className="font-editorial text-xl text-neutral-950 mb-1.5">
            Capital Building, 11th Floor
          </p>
          <p className="text-xs text-neutral-700 leading-relaxed">
            Please go to <strong>Capital Building, 11th floor</strong>, 5 minutes before your designated time ({formatDisplayTime(booking.start_time)}). No special attire or preparation is required.
          </p>
        </div>
      </div>

      {/* Calendar Actions */}
      <div className="pt-6 space-y-3">
        <span className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-2 text-center">
          Add to your calendar
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-4 border border-neutral-300 text-neutral-900 hover:bg-neutral-50 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors min-h-[44px]"
          >
            <Calendar className="w-4 h-4" />
            <span>Google Calendar</span>
          </a>

          <a
            href={`/api/calendar/${booking.id}`}
            download
            className="h-11 px-4 border border-neutral-300 text-neutral-900 hover:bg-neutral-50 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Apple / iCal (.ics)</span>
          </a>
        </div>

        <div className="pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
