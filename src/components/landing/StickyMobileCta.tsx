'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BUSINESS_CONFIG } from '@/config/business';

export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past hero section (~350px)
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-md border-t border-neutral-200 sm:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)] transition-transform duration-200">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 block">
            {BUSINESS_CONFIG.brandName}
          </span>
          <span className="font-mono font-medium text-sm text-neutral-950">
            {BUSINESS_CONFIG.durationMinutes}m · {BUSINESS_CONFIG.currencySymbol}{BUSINESS_CONFIG.priceInr}
          </span>
        </div>
        <Link
          href="/book"
          className="flex-1 max-w-[200px] inline-flex items-center justify-center gap-2 h-11 bg-neutral-950 text-white text-xs font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors active:scale-[0.98]"
        >
          <span>Book slot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
