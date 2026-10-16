'use client';

import React, { useState } from 'react';
import { AdminDashboardMetrics } from '@/types';
import { BUSINESS_CONFIG, CONTACT_CONFIG } from '@/config/business';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  IndianRupee,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetricsGridProps {
  metrics: AdminDashboardMetrics;
  onSyncSheets: () => Promise<any>;
  onTestConnection: () => Promise<{ success: boolean; message: string; method?: string }>;
  onSaveWebhook: (url: string) => Promise<{ success: boolean; message: string }>;
  isSyncing: boolean;
}

const APPS_SCRIPT_SNIPPET = `function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    service: 'Recharge Room Google Sheets Sync',
    sheetName: SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName(),
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Booking ID', 'Created At', 'Booking Date', 'Start Time', 'End Time',
        'Duration (Mins)', 'Customer Name', 'Mobile Number', 'Email Address',
        'Customer Type', 'College/Company/Dept', 'Customer Note',
        'Booking Status', 'Payment Status', 'Amount (INR)', 'Last Updated At'
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 16);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#F3F4F6');
      sheet.setFrozenRows(1);
    }

    if (data.is_test || data.action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Recharge Room webhook test verified successfully.',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var bookingId = data.id;
    var lastRow = sheet.getLastRow();
    var rowIndexToUpdate = -1;

    if (lastRow > 1) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] === bookingId) {
          rowIndexToUpdate = i + 2;
          break;
        }
      }
    }

    var rowValues = [
      data.id,
      data.created_at,
      data.booking_date,
      data.start_time,
      data.end_time,
      data.duration_minutes || 15,
      data.customer_name,
      data.customer_phone,
      data.customer_email,
      data.customer_type,
      data.organization_unit,
      data.notes || '',
      (data.booking_status || 'confirmed').toUpperCase(),
      (data.payment_status || 'pending').toUpperCase(),
      data.amount || 249,
      data.updated_at || new Date().toISOString()
    ];

    if (rowIndexToUpdate > 0) {
      sheet.getRange(rowIndexToUpdate, 1, 1, 16).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      id: bookingId,
      action: rowIndexToUpdate > 0 ? 'updated' : 'inserted'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

export function MetricsGrid({
  metrics,
  onSyncSheets,
  onTestConnection,
  onSaveWebhook,
  isSyncing,
}: MetricsGridProps) {
  const [showSetup, setShowSetup] = useState(!metrics.sheetsSync.isConfigured);
  const [webhookInput, setWebhookInput] = useState('');
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

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

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (_) {
      // fallback
    }
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setStatusFeedback(null);
    try {
      const res = await onTestConnection();
      setStatusFeedback({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
    } catch (err: any) {
      setStatusFeedback({
        type: 'error',
        text: err?.message || 'Connection test failed.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunSync = async () => {
    setStatusFeedback(null);
    try {
      const res = await onSyncSheets();
      if (res) {
        setStatusFeedback({
          type: res.success ? 'success' : 'error',
          text: res.message,
        });
      }
    } catch (err: any) {
      setStatusFeedback({
        type: 'error',
        text: err?.message || 'Sync failed.',
      });
    }
  };

  const handleSaveWebhookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookInput.trim()) return;

    setIsSavingWebhook(true);
    setStatusFeedback(null);
    try {
      const res = await onSaveWebhook(webhookInput.trim());
      setStatusFeedback({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
      if (res.success) {
        setWebhookInput('');
      }
    } catch (err: any) {
      setStatusFeedback({
        type: 'error',
        text: err?.message || 'Failed to save webhook.',
      });
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const isConfigured = metrics.sheetsSync.isConfigured;
  const configuredMethod = metrics.sheetsSync.configuredMethod;

  return (
    <div className="space-y-6">
      {/* 5 High-level operational cards */}
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

      {/* Google Sheets Sync Hub */}
      <div className="bg-white border border-neutral-200 p-5 sm:p-6 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 border border-neutral-200 bg-neutral-50 shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-neutral-900" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-editorial text-neutral-950 font-normal">
                  Google Sheets Synchronization
                </span>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                    isConfigured
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                  }`}
                >
                  {isConfigured
                    ? configuredMethod === 'webhook'
                      ? 'Active (Apps Script Webhook)'
                      : 'Active (Service Account)'
                    : 'Setup Action Required'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono mt-1">
                {isConfigured
                  ? `${metrics.sheetsSync.synced} of ${metrics.sheetsSync.total} bookings synced with your Google Sheet.`
                  : 'Bookings are safely stored in database, but Google Sheets requires connection authorization.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
            <a
              href={CONTACT_CONFIG.googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 border border-neutral-200 hover:bg-neutral-50 text-xs font-mono uppercase tracking-wider text-neutral-800 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Open Sheet</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>

            {isConfigured && (
              <>
                <button
                  type="button"
                  onClick={handleRunTest}
                  disabled={isTesting}
                  className="h-9 px-3 border border-neutral-200 hover:bg-neutral-50 text-xs font-mono uppercase tracking-wider text-neutral-800 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRunSync}
                  isLoading={isSyncing}
                  className="h-9 px-3 text-xs font-mono uppercase flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync {metrics.sheetsSync.pending > 0 ? `(${metrics.sheetsSync.pending})` : 'All'}</span>
                </Button>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowSetup(!showSetup)}
              className="h-9 px-3 border border-neutral-900 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-mono uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{showSetup ? 'Hide Setup' : isConfigured ? 'Update Webhook' : 'Connect Sheet (60s)'}</span>
              {showSetup ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Real-time Status Feedback Alert */}
        {statusFeedback && (
          <div
            className={`mt-4 p-3 border text-xs font-mono flex items-start gap-2.5 ${
              statusFeedback.type === 'success'
                ? 'bg-neutral-50 border-neutral-900 text-neutral-900'
                : 'bg-neutral-50 border-neutral-300 text-neutral-700'
            }`}
          >
            {statusFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-bold">
                {statusFeedback.type === 'success' ? 'Verification Success: ' : 'Notice: '}
              </span>
              {statusFeedback.text}
            </div>
          </div>
        )}

        {/* Expandable Setup Drawer */}
        {showSetup && (
          <div className="mt-6 pt-6 border-t border-neutral-200 space-y-6">
            <div>
              <h3 className="font-editorial text-lg text-neutral-950 mb-1">
                60-Second Instant Sheet Setup
              </h3>
              <p className="text-xs font-mono text-neutral-500">
                Google Sheets blocks unauthenticated writes. Adding this lightweight script lets Recharge Room post bookings directly to your sheet without complex cloud credentials.
              </p>
            </div>

            {/* 4 Step visual guide */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono text-neutral-600">
              <div className="p-3.5 border border-neutral-200 bg-neutral-50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Step 1</span>
                <p className="text-neutral-900 font-medium">Open Google Sheet</p>
                <p className="text-[11px] text-neutral-500">
                  Open your spreadsheet and click <strong className="text-neutral-800">Extensions &gt; Apps Script</strong> in the top menu.
                </p>
              </div>

              <div className="p-3.5 border border-neutral-200 bg-neutral-50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Step 2</span>
                <p className="text-neutral-900 font-medium">Paste &amp; Save</p>
                <p className="text-[11px] text-neutral-500">
                  Delete any code in Code.gs, click <strong className="text-neutral-800">Copy Script</strong> below, paste it, and click Save.
                </p>
              </div>

              <div className="p-3.5 border border-neutral-200 bg-neutral-50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Step 3</span>
                <p className="text-neutral-900 font-medium">Deploy as Web App</p>
                <p className="text-[11px] text-neutral-500">
                  Click <strong className="text-neutral-800">Deploy &gt; New deployment</strong>, select <strong className="text-neutral-800">Web app</strong>, set Who has access: <strong className="text-neutral-800">Anyone</strong>.
                </p>
              </div>

              <div className="p-3.5 border border-neutral-200 bg-neutral-50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Step 4</span>
                <p className="text-neutral-900 font-medium">Paste Webhook URL</p>
                <p className="text-[11px] text-neutral-500">
                  Copy the deployment URL ending in <code className="text-neutral-900 font-bold">/exec</code> and paste it in the box below.
                </p>
              </div>
            </div>

            {/* Copy button & Webhook input form */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleCopyCode}
                className="h-10 px-4 border border-neutral-300 hover:border-neutral-950 bg-white text-xs font-mono uppercase tracking-wider text-neutral-900 inline-flex items-center justify-center gap-2 shrink-0 transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Apps Script Code'}</span>
              </button>

              <form onSubmit={handleSaveWebhookSubmit} className="flex-1 flex gap-2">
                <input
                  type="url"
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  required
                  className="flex-1 h-10 px-3 border border-neutral-300 text-xs font-mono focus:border-neutral-950 focus:outline-none"
                />
                <Button
                  type="submit"
                  isLoading={isSavingWebhook}
                  className="h-10 px-4 text-xs font-mono uppercase shrink-0"
                >
                  Save &amp; Test
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
