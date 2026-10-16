'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BUSINESS_CONFIG, CONTACT_CONFIG } from '@/config/business';
import { getAvailableDates } from '@/lib/utils';
import { TimeSlot, CustomerType, Booking } from '@/types';
import { DatePicker } from '@/components/booking/DatePicker';
import { TimeSlotSelector } from '@/components/booking/TimeSlotSelector';
import { CustomerForm } from '@/components/booking/CustomerForm';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { ConfirmationCard } from '@/components/booking/ConfirmationCard';
import { ArrowLeft } from 'lucide-react';

export default function BookPage() {
  const availableDates = getAvailableDates();
  const initialDate = availableDates.find((d) => d.isOperating)?.dateStr || availableDates[0].dateStr;

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(true);

  // Coupon code state
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Form details - Streamlined: Name and Mobile mandatory, Email optional
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    customerType: 'student' as CustomerType,
    organizationUnit: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Active pricing based on applied coupon
  const currentPrice =
    couponCode === 'RRMUFREE'
      ? 0
      : couponCode === 'RRMU50'
      ? 199
      : BUSINESS_CONFIG.priceInr;

  // Load availability whenever selected date changes
  const fetchSlots = useCallback(async (dateStr: string, isSilent = false) => {
    if (!isSilent) {
      setIsLoadingSlots(true);
      setSelectedSlot(null);
    }
    try {
      const res = await fetch(`/api/availability?date=${dateStr}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.slots)) {
        setSlots(data.slots);

        // Real-time conflict protection: If currently selected slot is now taken, reset and alert
        if (selectedSlot) {
          const matchingSlot = data.slots.find((s: TimeSlot) => s.time === selectedSlot);
          if (matchingSlot && !matchingSlot.available) {
            setSelectedSlot(null);
            setSubmitError(`The ${selectedSlot} slot was just reserved by another visitor. Please select an available slot.`);
          }
        }
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      if (!isSilent) setSlots([]);
    } finally {
      if (!isSilent) setIsLoadingSlots(false);
    }
  }, [selectedSlot]);

  // Initial fetch when date changes
  useEffect(() => {
    fetchSlots(selectedDate, false);
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Multi-user real-time polling: Keep slot availability synchronized every 15s + on window focus
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchSlots(selectedDate, true);
    }, 15000);

    const handleWindowFocus = () => {
      fetchSlots(selectedDate, true);
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [selectedDate, fetchSlots]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleApplyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'RRMUFREE') {
      setCouponCode('RRMUFREE');
      setDiscountAmount(249);
      return {
        success: true,
        message: 'Coupon RRMUFREE verified! 100% Free Session (₹0).',
        discount: 249,
      };
    }
    if (clean === 'RRMU50') {
      setCouponCode('RRMU50');
      setDiscountAmount(50);
      return {
        success: true,
        message: 'Coupon RRMU50 verified! You save ₹50 on this session.',
        discount: 50,
      };
    }
    return {
      success: false,
      message: "Invalid coupon code. Only 'RRMU50' or 'RRMUFREE' are accepted.",
    };
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
  };

  // Only Name and Mobile Number are mandatory. Email is optional.
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Please provide your full name.';
    }

    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '').replace(/^(\+91|91)/, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please provide a valid 10-digit mobile number.';
    }

    // Email is strictly optional; validate format only if provided
    if (formData.email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address or leave blank.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmBooking = async () => {
    setSubmitError(null);

    if (!selectedSlot) {
      setSubmitError('Please select a 15-minute time slot above.');
      return;
    }

    if (!validateForm()) {
      setSubmitError('Please complete your name and mobile number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_date: selectedDate,
          start_time: selectedSlot,
          customer_name: formData.name.trim(),
          customer_phone: formData.phone.trim(),
          customer_email: formData.email.trim() || undefined,
          customer_type: formData.customerType,
          organization_unit: formData.organizationUnit?.trim() || undefined,
          notes: formData.notes?.trim() || undefined,
          coupon_code: couponCode || undefined,
          discount_amount: discountAmount > 0 ? discountAmount : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error || 'Failed to complete booking. Please try again.');
        // If conflict error (409), immediately refresh slots to reflect updated availability
        if (response.status === 409) {
          fetchSlots(selectedDate, false);
        }
        setIsSubmitting(false);
        return;
      }

      // Successful reservation: Save to client storage and display confirmation immediately
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(`booking_${result.booking.id}`, JSON.stringify(result.booking));
          sessionStorage.setItem('latest_booking', JSON.stringify(result.booking));
          window.history.pushState(null, '', `/booking/confirmation/${result.booking.id}`);
        } catch (storageErr) {
          console.warn('Could not save booking to sessionStorage:', storageErr);
        }
      }

      // Dual-sync to Google Sheet directly from customer's browser.
      // Real browser requests from mobile/residential IPs bypass cloud IP challenges completely.
      if (CONTACT_CONFIG.defaultWebhookUrl && result.booking) {
        try {
          fetch(CONTACT_CONFIG.defaultWebhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              ...result.booking,
              amount: result.booking.amount === 0 ? '0' : result.booking.amount,
              coupon_code: result.booking.coupon_code || couponCode || 'NONE',
            }),
          }).catch((syncErr) => console.warn('Client sheets sync notice:', syncErr));
        } catch (_) {}
      }

      setConfirmedBooking(result.booking);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setSubmitError('A network error occurred. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>

          <Link href="/" className="font-editorial text-xl font-medium tracking-tight text-neutral-950">
            {BUSINESS_CONFIG.brandName}
          </Link>

          <div className="text-right">
            <span className="font-mono text-xs text-neutral-900 font-medium">
              {BUSINESS_CONFIG.currencySymbol}{currentPrice}
            </span>
          </div>
        </div>
      </header>

      {/* Main Booking Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 py-10 sm:py-16">
        {confirmedBooking ? (
          <ConfirmationCard booking={confirmedBooking} />
        ) : (
          <>
            <div className="mb-10 text-center max-w-xl mx-auto">
              <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-2 block">
                Reserve Your 15 Minutes
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950 mb-3">
                Book your session.
              </h1>
              <p className="text-sm sm:text-base text-neutral-600">
                {currentPrice === 0
                  ? 'One guest per slot. 100% complimentary session with coupon RRMUFREE.'
                  : `One guest per slot. Pay ${BUSINESS_CONFIG.currencySymbol}${currentPrice} in person after your session.`}
              </p>
            </div>

            <div className="space-y-10">
              {/* Step 1: Date Picker */}
              <DatePicker
                dates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
              />

              {/* Step 2: Time Slot Selector */}
              <TimeSlotSelector
                slots={slots}
                selectedSlot={selectedSlot}
                onSelectSlot={(s) => setSelectedSlot(s)}
                isLoading={isLoadingSlots}
              />

              {/* Step 3: Customer Information */}
              {selectedSlot && (
                <CustomerForm
                  data={formData}
                  onChange={handleFieldChange}
                  errors={formErrors}
                />
              )}

              {/* Step 4: Summary & Confirm */}
              {selectedSlot && (
                <BookingSummary
                  date={selectedDate}
                  time={selectedSlot}
                  name={formData.name || 'Your Name'}
                  phone={formData.phone || 'Your Phone'}
                  email={formData.email}
                  customerType={formData.customerType}
                  couponCode={couponCode}
                  discountAmount={discountAmount}
                  finalAmount={currentPrice}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                  isSubmitting={isSubmitting}
                  onConfirm={handleConfirmBooking}
                  error={submitError}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-neutral-200 py-6 text-center text-xs font-mono text-neutral-500">
        <p>{BUSINESS_CONFIG.brandName} · Strictly 15-minute quick relaxation sessions</p>
      </footer>
    </div>
  );
}
