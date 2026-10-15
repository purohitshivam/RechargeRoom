'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, AdminDashboardMetrics, BookingStatus, PaymentStatus } from '@/types';
import { MetricsGrid } from './MetricsGrid';
import { BookingTable } from './BookingTable';
import { Button } from '@/components/ui/button';
import { Download, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminDashboardClientProps {
  initialBookings: Booking[];
  initialMetrics: AdminDashboardMetrics;
}

export function AdminDashboardClient({
  initialBookings,
  initialMetrics,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [metrics, setMetrics] = useState<AdminDashboardMetrics>(initialMetrics);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setMetrics(data.metrics || initialMetrics);
      }
    } catch (err) {
      console.error('Failed to refresh admin data:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_status: status }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleUpdatePayment = async (id: string, payment: PaymentStatus) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: payment }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to update payment:', err);
    }
  };

  const handleSyncSheets = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/sync/sheets', { method: 'POST' });
      await refreshData();
    } catch (err) {
      console.error('Failed to sync sheets:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Admin Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
              title="Return to site"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="font-editorial text-lg sm:text-xl font-normal text-neutral-950 block leading-tight">
                Recharge Room
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Founder Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/csv"
              download
              className="h-9 px-3 border border-neutral-200 hover:bg-neutral-50 text-xs font-mono uppercase tracking-wider text-neutral-800 inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>

            <button
              onClick={handleLogout}
              className="h-9 px-3 border border-neutral-200 hover:bg-neutral-50 text-xs font-mono uppercase tracking-wider text-neutral-800 inline-flex items-center gap-1.5 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-12 space-y-8">
        <div>
          <h1 className="font-editorial text-3xl font-normal text-neutral-950 mb-1">
            Dashboard Overview
          </h1>
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
            Live schedule, payment tracking, and reservation controls
          </p>
        </div>

        {/* Top metrics and sheets health */}
        <MetricsGrid
          metrics={metrics}
          onSyncSheets={handleSyncSheets}
          isSyncing={isSyncing}
        />

        {/* Bookings Table / List */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-editorial text-2xl font-normal text-neutral-950">
              All Bookings ({bookings.length})
            </h2>
          </div>

          <BookingTable
            bookings={bookings}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePayment={handleUpdatePayment}
            isLoading={isLoading}
          />
        </div>
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-xs font-mono text-neutral-500">
        Recharge Room · Founder Administration Console
      </footer>
    </div>
  );
}
