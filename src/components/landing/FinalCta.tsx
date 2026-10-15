import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BUSINESS_CONFIG } from '@/config/business';

export function FinalCta() {
  return (
    <section className="py-20 sm:py-28 border-b border-neutral-200 text-center">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3 block">
          Ready When You Are
        </span>
        <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-950 mb-6 leading-tight">
          Make room for a reset.
        </h2>
        <p className="text-base sm:text-lg text-neutral-600 mb-10 max-w-xl mx-auto">
          Your next break can be {BUSINESS_CONFIG.durationMinutes} minutes away. View real-time availability and hold your preferred slot instantly.
        </p>

        <Link
          href="/book"
          className="inline-flex items-center justify-center gap-3 h-13 px-9 bg-neutral-950 text-white text-sm font-medium tracking-wider uppercase hover:bg-neutral-800 transition-all min-h-[48px]"
        >
          <span>Find your slot</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="mt-6">
          <span className="text-xs font-mono text-neutral-500">
            {BUSINESS_CONFIG.durationMinutes} min · {BUSINESS_CONFIG.currencySymbol}{BUSINESS_CONFIG.priceInr} · Pay in person
          </span>
        </div>
      </div>
    </section>
  );
}
