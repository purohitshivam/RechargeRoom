'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BUSINESS_CONFIG } from '@/config/business';
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

  // Form details
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

  // Load availability whenever selected date changes
  const fetchSlots = async (dateStr: string) => {
    setIsLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/availability?date=${dateStr}`);
      const data = await res.json();
      if (res.ok && data.slots) {
        setSlots(data.slots);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate]);

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Please provide your full name.';
    }

    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '').replace(/^(\+91|91)/, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please provide a valid 10-digit mobile number.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!formData.organizationUnit.trim() || formData.organizationUnit.trim().length < 2) {
      errors.organizationUnit =
        formData.customerType === 'student'
          ? 'Please enter your college name or department.'
          : 'Please enter your department or workplace unit.';
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
      setSubmitError('Please complete all required fields correctly.');
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
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          customer_type: formData.customerType,
          organization_unit: formData.organizationUnit,
          notes: formData.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error || 'Failed to complete booking. Please try again.');
        if (response.status === 409) {
          fetchSlots(selectedDate);
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
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
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
              {BUSINESS_CONFIG.currencySymbol}{BUSINESS_CONFIG.priceInr}
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
                One guest per slot. Pay {BUSINESS_CONFIG.currencySymbol}{BUSINESS_CONFIG.priceInr} in person after your session.
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
                  email={formData.email || 'Your Email'}
                  customerType={formData.customerType}
                  organizationUnit={formData.organizationUnit || 'Campus / Department'}
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
