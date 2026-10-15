'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BUSINESS_CONFIG } from '@/config/business';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid administrator password.');
        setIsLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError('An error occurred during authentication.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center px-5">
      <div className="w-full max-w-md bg-white border border-neutral-200 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-neutral-950 text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-1">
            Founder Access
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-normal text-neutral-950">
            {BUSINESS_CONFIG.brandName} Admin
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            Enter your management key to access bookings, revenue, and live schedules.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5"
            >
              Admin Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 px-3.5 bg-white border border-neutral-300 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full h-11 text-xs uppercase tracking-wider">
            Access Dashboard
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-neutral-950"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
