import { BusinessConfig } from '@/types';

/**
 * Recharge Room Business Configuration
 * Single source of truth for all operational, pricing, schedule, and brand parameters.
 */
export const BUSINESS_CONFIG: BusinessConfig = {
  brandName: 'Recharge Room',
  tagline: 'Your 15-minute reset.',
  serviceDescription: '15-minute head, neck and shoulder massages designed for MU students and employees.',
  durationMinutes: 15,
  priceInr: 249,
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata',

  // Operating days: Monday (1) to Saturday (6). Sunday (0) closed.
  operatingDays: [1, 2, 3, 4, 5, 6],

  // Operating Hours: 12:00 PM to 8:00 PM
  operatingHours: {
    open: '12:00',
    close: '20:00', // Last 15-minute slot starts at 19:45 and ends at 20:00
  },

  // Daily breaks: 2:30 PM - 3:00 PM and 5:30 PM - 6:00 PM
  breaks: [
    {
      start: '14:30',
      end: '15:00',
      label: 'Afternoon Reset',
    },
    {
      start: '17:30',
      end: '18:00',
      label: 'Evening Reset',
    },
  ],

  // Booking Horizon & Advance Notice
  bookingHorizonDays: 7, // Customers can book up to 7 days ahead
  minAdvanceNoticeMinutes: 15, // Slot cannot be booked less than 15 minutes before start
  capacityPerSlot: 1, // Exactly 1 customer per 15-minute slot

  locationNote: 'Capital Building, 11th Floor',
  paymentNote: 'Pay ₹249 in person after your session. No online payment required.',
};

export const CONTACT_CONFIG = {
  supportEmail: 'hello@rechargeroom.co.in',
  operatingNotice: 'Strictly 15-minute relaxation sessions. Not intended for medical treatment.',
  termsEffectiveDate: 'October 2026',
  arrivalGuidance: 'Please go to Capital Building, 11th Floor, 5 minutes before your designated time.',
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1jsla1KjhwcmCRdFURifSEa2_Eo3kYPpyBssie97K9qE/edit',
  defaultSheetId: '1jsla1KjhwcmCRdFURifSEa2_Eo3kYPpyBssie97K9qE',
  defaultWebhookUrl: 'https://script.google.com/macros/s/AKfycbzvDNcoAuJamYOiC9WSYJUgAoX6IXjJqk8EGSz3Zy1vhRd2em1zGBajxITh6dXnCxgdFA/exec',
};
