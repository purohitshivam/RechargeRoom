'use client';

import React, { useState } from 'react';
import { Booking, BookingStatus, PaymentStatus } from '@/types';
import { BUSINESS_CONFIG } from '@/config/business';
import { formatDisplayDate, formatDisplayTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, IndianRupee, XCircle, Phone, Mail, Building } from 'lucide-react';

interface BookingTableProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, status: BookingStatus) => Promise<void>;
  onUpdatePayment: (id: string, payment: PaymentStatus) => Promise<void>;
  isLoading: boolean;
}

export function BookingTable({
  bookings,
  onUpdateStatus,
  onUpdatePayment,
  isLoading,
}: BookingTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      b.id.toLowerCase().includes(q) ||
      b.customer_name.toLowerCase().includes(q) ||
      b.customer_phone.toLowerCase().includes(q) ||
      (b.customer_email || '').toLowerCase().includes(q) ||
      (b.organization_unit || '').toLowerCase().includes(q) ||
      (b.coupon_code || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || b.booking_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || b.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    setActiveActionId(id);
    try {
      await onUpdateStatus(id, newStatus);
    } finally {
      setActiveActionId(null);
    }
  };

  const handlePaymentChange = async (id: string, newPayment: PaymentStatus) => {
    setActiveActionId(id);
    try {
      await onUpdatePayment(id, newPayment);
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-white border border-neutral-200 p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, mobile, reference, or department..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Booking Status"
            className="h-10 px-3 bg-white border border-neutral-200 text-xs font-mono uppercase text-neutral-800 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            aria-label="Filter by Payment Status"
            className="h-10 px-3 bg-white border border-neutral-200 text-xs font-mono uppercase text-neutral-800 focus:outline-none"
          >
            <option value="all">All Payments</option>
            <option value="pending">Payment: Pending</option>
            <option value="paid">Payment: Paid</option>
          </select>
        </div>
      </div>

      {/* Table for Desktop, Card list for Mobile */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-neutral-600 mb-1">No bookings match the selected criteria.</p>
            <p className="text-xs font-mono text-neutral-400">Total records: {bookings.length}</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/70 font-mono uppercase text-neutral-500">
                    <th className="py-3 px-4">Ref & Time</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Affiliation</th>
                    <th className="py-3 px-4">Booking Status</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredBookings.map((b) => {
                    const isProcessing = activeActionId === b.id;

                    return (
                      <tr key={b.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-medium text-neutral-900">{b.id}</div>
                          <div className="text-neutral-600 mt-0.5">
                            {formatDisplayDate(b.booking_date)} · {formatDisplayTime(b.start_time)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-neutral-900">{b.customer_name}</div>
                          <div className="font-mono text-neutral-500 text-[11px]">
                            {b.customer_phone}{b.customer_email ? ` · ${b.customer_email}` : ''}
                          </div>
                          {b.notes && (
                            <div className="text-[11px] text-neutral-400 italic mt-0.5">
                              &ldquo;{b.notes}&rdquo;
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-700">
                            {b.customer_type}
                          </span>
                          {b.organization_unit && (
                            <div className="text-neutral-600 mt-1 truncate max-w-[180px]">
                              {b.organization_unit}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              b.booking_status === 'confirmed'
                                ? 'default'
                                : b.booking_status === 'completed'
                                ? 'solid'
                                : 'subtle'
                            }
                          >
                            {b.booking_status}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-editorial text-sm font-normal text-neutral-950">
                              {BUSINESS_CONFIG.currencySymbol}{b.amount}
                            </span>
                            {b.coupon_code && (
                              <span className="text-[9px] font-mono font-bold uppercase px-1 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {b.coupon_code}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-mono uppercase px-1.5 py-0.5 border ${
                                b.payment_status === 'paid'
                                  ? 'bg-neutral-950 text-white border-neutral-950'
                                  : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                              }`}
                            >
                              {b.payment_status}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.booking_status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isProcessing}
                                onClick={() => handleStatusChange(b.id, 'completed')}
                                className="h-7 text-[10px] px-2 font-mono uppercase"
                              >
                                Mark Done
                              </Button>
                            )}

                            {b.payment_status === 'pending' && b.booking_status !== 'cancelled' && (
                              <Button
                                size="sm"
                                variant="primary"
                                disabled={isProcessing}
                                onClick={() => handlePaymentChange(b.id, 'paid')}
                                className="h-7 text-[10px] px-2 font-mono uppercase"
                              >
                                Mark Paid
                              </Button>
                            )}

                            {b.booking_status !== 'cancelled' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isProcessing}
                                onClick={() => {
                                  if (confirm(`Cancel reservation ${b.id}? This will release the slot.`)) {
                                    handleStatusChange(b.id, 'cancelled');
                                  }
                                }}
                                className="h-7 text-[10px] px-2 font-mono uppercase text-neutral-500 hover:text-red-700"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="block lg:hidden divide-y divide-neutral-200">
              {filteredBookings.map((b) => {
                const isProcessing = activeActionId === b.id;

                return (
                  <div key={b.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-neutral-900">
                        {b.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            b.booking_status === 'confirmed'
                              ? 'default'
                              : b.booking_status === 'completed'
                              ? 'solid'
                              : 'subtle'
                          }
                        >
                          {b.booking_status}
                        </Badge>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 border ${
                            b.payment_status === 'paid'
                              ? 'bg-neutral-950 text-white border-neutral-950'
                              : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                          }`}
                        >
                          {b.payment_status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="font-editorial text-lg text-neutral-950">
                        {b.customer_name}
                      </div>
                      <div className="text-xs text-neutral-600 mt-0.5">
                        {formatDisplayDate(b.booking_date)} at {formatDisplayTime(b.start_time)}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-neutral-600 font-mono pt-1 border-t border-neutral-100">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{b.customer_phone}{b.customer_email ? ` · ${b.customer_email}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="truncate">
                          {b.customer_type}{b.organization_unit ? ` · ${b.organization_unit}` : ''}
                        </span>
                      </div>
                    </div>

                    {b.notes && (
                      <div className="p-2 bg-neutral-50 text-[11px] text-neutral-600 italic">
                        Note: &ldquo;{b.notes}&rdquo;
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-neutral-100">
                      <div className="flex items-center gap-1.5">
                        <span className="font-editorial text-base text-neutral-950">
                          {BUSINESS_CONFIG.currencySymbol}{b.amount}
                        </span>
                        {b.coupon_code && (
                          <span className="text-[9px] font-mono font-bold uppercase px-1 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {b.coupon_code}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {b.booking_status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isProcessing}
                            onClick={() => handleStatusChange(b.id, 'completed')}
                            className="h-8 text-[11px] px-2.5 font-mono uppercase"
                          >
                            Mark Done
                          </Button>
                        )}

                        {b.payment_status === 'pending' && b.booking_status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={isProcessing}
                            onClick={() => handlePaymentChange(b.id, 'paid')}
                            className="h-8 text-[11px] px-2.5 font-mono uppercase"
                          >
                            Mark Paid
                          </Button>
                        )}

                        {b.booking_status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isProcessing}
                            onClick={() => {
                              if (confirm(`Cancel reservation ${b.id}? This will release the slot.`)) {
                                handleStatusChange(b.id, 'cancelled');
                              }
                            }}
                            className="h-8 text-[11px] px-2 text-neutral-500 hover:text-red-700 font-mono uppercase"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
