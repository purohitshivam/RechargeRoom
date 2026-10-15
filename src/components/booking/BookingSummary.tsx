'use client';

import React from 'react';
import { BUSINESS_CONFIG } from '@/config/business';
import { formatDisplayDate, formatDisplayTime, addMinutesToTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface BookingSummaryProps {
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  customerType: string;
  organizationUnit: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  error?: string | null;
}

export function BookingSummary({
  date,
  time,
  name,
  phone,
  email,
  customerType,
  organizationUnit,
  isSubmitting,
  onConfirm,
  error,
}: BookingSummaryProps) {
  const endTime = addMinutesToTime(time, BUSINESS_CONFIG.durationMinutes);

  return (
    <div className="w-full">
      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
        4. Booking Summary
      </label>

      <div className="bg-white border border-neutral-200 p-6 sm:p-8">
        <div className="pb-6 mb-6 border-b border-neutral-200">
          <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 block mb-1">
            {BUSINESS_CONFIG.brandName}
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-neutral-950">
            15-Minute Head, Neck & Shoulder Massage
          </h3>
        </div>

        <div className="space-y-3.5 text-sm mb-8">
          <div className="flex justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500">Date</span>
            <span className="font-medium text-neutral-900">{formatDisplayDate(date)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500">Time</span>
            <span className="font-mono font-medium text-neutral-900">
              {formatDisplayTime(time)} – {formatDisplayTime(endTime)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500">Duration</span>
            <span className="font-medium text-neutral-900">
              {BUSINESS_CONFIG.durationMinutes} minutes
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500">Guest</span>
            <span className="font-medium text-neutral-900 text-right">
              {name} ({customerType === 'student' ? 'Student' : 'Employee'})
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500">Affiliation</span>
            <span className="font-medium text-neutral-900 text-right max-w-[200px] truncate">
              {organizationUnit}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500">Contact</span>
            <span className="font-mono text-xs text-neutral-900 text-right">
              {phone} · {email}
            </span>
          </div>

          <div className="flex justify-between py-2 pt-4">
            <span className="font-medium text-neutral-900">Total Due</span>
            <div className="text-right">
              <span className="font-editorial text-2xl font-normal text-neutral-950">
                {BUSINESS_CONFIG.currencySymbol}{BUSINESS_CONFIG.priceInr}
              </span>
              <span className="block text-[11px] font-mono text-neutral-500">
                Pay after session
              </span>
            </div>
          </div>
        </div>

        {/* Physical payment notice */}
        <div className="p-4 bg-neutral-100 border border-neutral-200 mb-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-neutral-900 mt-0.5 shrink-0" />
          <p className="text-xs text-neutral-700 leading-relaxed">
            <strong className="text-neutral-950 block mb-0.5">Physical Payment Guarantee:</strong>
            Your slot is reserved online. Payment of {BUSINESS_CONFIG.currencySymbol}{BUSINESS_CONFIG.priceInr} is collected in person via UPI or cash after your session. No online payment or card entry is required.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-50 border border-red-200 text-red-800 text-xs leading-relaxed">
            {error}
          </div>
        )}

        <Button
          onClick={onConfirm}
          isLoading={isSubmitting}
          className="w-full h-13 text-sm tracking-wider uppercase flex items-center justify-center gap-2 min-h-[48px]"
        >
          <span>Confirm my booking</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
