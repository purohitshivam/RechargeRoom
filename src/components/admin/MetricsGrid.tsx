'use client';

import React from 'react';
import { AdminDashboardMetrics } from '@/types';
import { BUSINESS_CONFIG } from '@/config/business';
import { Calendar, Users, CheckCircle2, Clock, IndianRupee, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetricsGridProps {
  metrics: AdminDashboardMetrics;
  onSyncSheets: () => void;
  isSyncing: boolean;
}

export function MetricsGrid({ metrics, onSyncSheets, isSyncing }: MetricsGridProps) {
  const cards = [
    {
      label: "Today's Bookings",
      value: metrics.todayConfirmed,
      subtext: 'Confirmed for today',
      icon: Calendar,
    },
    {
      label: 'Upcoming Sessions',
      value: metrics.upcomingBookings,
      subtext: 'Next 7 days',
      icon: Clock,
    },
    {
      label: 'Sessions Completed',
      value: metrics.completedSessions,
      subtext: 'Delivered to date',
      icon: CheckCircle2,
    },
    {
      label: 'Pending Payments',
      value: metrics.pendingPayments,
      subtext: 'Awaiting cash or UPI',
      icon: Users,
    },
    {
      label: 'Collected Revenue',
      value: `${BUSINESS_CONFIG.currencySymbol}${metrics.collectedRevenue}`,
      subtext: `From paid sessions only (Expected: ${BUSINESS_CONFIG.currencySymbol}${metrics.expectedRevenue})`,
      icon: IndianRupee,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`p-5 sm:p-6 border bg-white flex flex-col justify-between ${
                c.highlight ? 'border-neutral-900 col-span-2 lg:col-span-1' : 'border-neutral-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                    {c.label}
                  </span>
                  <Icon className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="font-editorial text-2xl sm:text-3xl font-normal text-neutral-950">
                  {c.value}
                </div>
              </div>
              <p className="mt-2 text-[11px] text-neutral-500 font-mono leading-tight">
                {c.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Google Sheets Sync Health Bar */}
      <div className="p-4 sm:p-5 bg-white border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-neutral-800 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-900 font-medium">
                Google Sheets Sync Status:
              </span>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                  metrics.sheetsSync.isConfigured
                    ? metrics.sheetsSync.pending === 0
                      ? 'bg-neutral-100 text-neutral-800 border-neutral-300'
                      : 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                {metrics.sheetsSync.isConfigured
                  ? metrics.sheetsSync.pending === 0
                    ? 'All Synced'
                    : `${metrics.sheetsSync.pending} Pending`
                  : 'Config Pending'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {metrics.sheetsSync.isConfigured
                ? `${metrics.sheetsSync.synced} of ${metrics.sheetsSync.total} bookings synchronized with "Recharge Room Bookings" spreadsheet.`
                : 'Service account credentials not configured yet. Bookings are safely stored in database.'}
            </p>
          </div>
        </div>

        {metrics.sheetsSync.isConfigured && (
          <Button
            size="sm"
            variant="outline"
            onClick={onSyncSheets}
            isLoading={isSyncing}
            className="shrink-0 flex items-center gap-2 h-9 text-xs font-mono uppercase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Sheets</span>
          </Button>
        )}
      </div>
    </div>
  );
}
