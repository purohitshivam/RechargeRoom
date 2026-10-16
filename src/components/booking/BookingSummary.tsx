'use client';

import React, { useState } from 'react';
import { BUSINESS_CONFIG } from '@/config/business';
import { formatDisplayDate, formatDisplayTime, addMinutesToTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookingSummaryProps {
  date: string;
  time: string;
  name: string;
  phone: string;
  email?: string;
  customerType: string;
  couponCode: string;
  discountAmount: number;
  finalAmount: number;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: () => void;
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
  couponCode,
  discountAmount,
  finalAmount,
  onApplyCoupon,
  onRemoveCoupon,
  isSubmitting,
  onConfirm,
  error,
}: BookingSummaryProps) {
  const endTime = addMinutesToTime(time, BUSINESS_CONFIG.durationMinutes);
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = onApplyCoupon(couponInput.trim());
    setCouponFeedback(res);
  };

  const handleRemove = () => {
    onRemoveCoupon();
    setCouponInput('');
    setCouponFeedback(null);
  };

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
          <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-neutral-950">
            15-Minute Head, Neck & Shoulder Massage
          </h3>
        </div>

        <div className="space-y-3.5 text-sm mb-6">
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
            <span className="text-neutral-500">Contact</span>
            <span className="font-mono text-xs text-neutral-900 text-right">
              {phone}
              {email ? ` · ${email}` : ''}
            </span>
          </div>
        </div>

        {/* Coupon Code Section */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 mb-6">
          <label
            htmlFor="coupon-input"
            className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-2 font-medium"
          >
            Apply Coupon Code
          </label>

          {couponCode ? (
            <div className="flex items-center justify-between p-3 bg-white border border-neutral-300">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-neutral-950" />
                <span className="font-mono font-bold text-sm text-neutral-950 tracking-wider">
                  {couponCode}
                </span>
                <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  -₹{discountAmount} Applied
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-neutral-500 hover:text-neutral-950 underline font-mono uppercase"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="flex gap-2">
              <input
                id="coupon-input"
                type="text"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setCouponFeedback(null);
                }}
                placeholder="Enter coupon code (e.g. RRMU50, RRMUFREE)"
                className="flex-1 h-10 px-3.5 bg-white border border-neutral-300 font-mono text-xs sm:text-sm uppercase text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950"
              />
              <button
                type="submit"
                className="h-10 px-5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider transition-colors shrink-0"
              >
                Apply
              </button>
            </form>
          )}

          {couponFeedback && !couponCode && (
            <div className="mt-2.5 text-xs flex items-center gap-1.5 text-red-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{couponFeedback.message}</span>
            </div>
          )}

          {couponCode && (
            <div className="mt-2 text-xs flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                {couponCode === 'RRMUFREE'
                  ? 'Coupon RRMUFREE verified! 100% Free Session (₹0).'
                  : `Coupon ${couponCode} verified! You save ₹${discountAmount} on this session.`}
              </span>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 py-2 border-t border-neutral-200 mb-6">
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Standard Session Rate</span>
            <span className="font-mono">
              {BUSINESS_CONFIG.currencySymbol}{BUSINESS_CONFIG.priceInr}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-700 font-medium">
              <span>Coupon Discount ({couponCode})</span>
              <span className="font-mono">-₹{discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-3 border-t border-neutral-200">
            <span className="font-semibold text-neutral-900">Total Due</span>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight font-sans">
                {BUSINESS_CONFIG.currencySymbol}{finalAmount}
              </span>
              <span className="block text-[11px] font-mono text-neutral-500">
                {finalAmount === 0 ? 'Complimentary session' : 'Pay in person after massage'}
              </span>
            </div>
          </div>
        </div>

        {/* Physical payment notice */}
        <div className="p-4 bg-neutral-100 border border-neutral-200 mb-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-neutral-900 mt-0.5 shrink-0" />
          <p className="text-xs text-neutral-700 leading-relaxed font-normal">
            <strong className="text-neutral-950 block mb-0.5 font-semibold">
              {finalAmount === 0 ? 'Free Complimentary Session:' : 'Pay On-Site via UPI or Cash:'}
            </strong>
            {finalAmount === 0
              ? 'Your slot is 100% complimentary with coupon RRMUFREE. No payment is required.'
              : `Your slot is reserved online with zero advance card payment. Pay ${BUSINESS_CONFIG.currencySymbol}${finalAmount} physically after your 15-minute session is complete.`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-6 bg-red-50 border border-red-200 text-red-800 text-xs leading-relaxed font-medium">
            {error}
          </div>
        )}

        <Button
          onClick={onConfirm}
          isLoading={isSubmitting}
          className="w-full h-13 text-sm tracking-wider uppercase flex items-center justify-center gap-2 min-h-[48px] font-medium"
        >
          <span>Confirm my booking · {finalAmount === 0 ? 'FREE' : `${BUSINESS_CONFIG.currencySymbol}${finalAmount}`}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
