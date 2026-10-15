import { BusinessConfig } from '@/types';

/**
 * Recharge Room Business Configuration
 * Single source of truth for all operational, pricing, schedule, and brand parameters.
 * Note: Schedule values are initial production placeholders and can be adjusted anytime.
 */
export const BUSINESS_CONFIG: BusinessConfig = {
  brandName: 'Recharge Room',
  tagline: 'Your 15-minute reset.',
  serviceDescription: '15-minute head, neck and shoulder massages designed for MU students and employees.',
  durationMinutes: 15,
  priceInr: 249,
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata',

  // Operating days: 1 (Mon) to 6 (Sat). 0 is Sunday.
  operatingDays: [1, 2, 3, 4, 5, 6],

  // Operating Hours (24-hour format in Asia/Kolkata timezone)
  operatingHours: {
    open: '10:00',
    close: '18:00', // Last 15-minute slot starts at 17:45
  },

  // Daily sanitization and rest breaks
  breaks: [
    {
      start: '13:30',
      end: '14:15',
      label: 'Afternoon Reset & Sanitation',
    },
  ],

  // Booking Horizon & Advance Notice
  bookingHorizonDays: 7, // Customers can book up to 7 days ahead
  minAdvanceNoticeMinutes: 15, // Slot cannot be booked less than 15 minutes before start
  capacityPerSlot: 1, // Exactly 1 customer per 15-minute slot

  locationNote: 'MU Campus / Workplace Hub (Detailed room instructions sent on confirmation)',
  paymentNote: 'Pay ₹249 in person after your session. No online payment required.',
};

export const CONTACT_CONFIG = {
  supportEmail: 'hello@rechargeroom.co.in',
  operatingNotice: 'Strictly 15-minute relaxation sessions. Not intended for medical treatment.',
  termsEffectiveDate: 'October 2026',
};
