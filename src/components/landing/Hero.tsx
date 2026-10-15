import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BUSINESS_CONFIG } from '@/config/business';

export function Hero() {
  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-neutral-200 overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-mono tracking-widest uppercase">
          <span>A little time for yourself</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-editorial text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight text-neutral-950 mb-6 leading-[1.08] text-balance">
          Your 15-minute reset.
        </h1>

        {/* Supporting Copy */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 leading-relaxed font-normal mb-8 text-balance">
          Head, neck, and shoulder massages designed to fit seamlessly into your day. Step away for 15 minutes. Return feeling refreshed, focused, and unburdened.
        </p>

        {/* Distinctive Price Pill */}
        <div className="inline-block mb-10 px-4 py-2 border-y border-neutral-300 font-mono text-sm tracking-wider uppercase text-neutral-900">
          {BUSINESS_CONFIG.durationMinutes} minutes · {BUSINESS_CONFIG.currencySymbol}{BUSINESS_CONFIG.priceInr} · Pay in person
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto sm:max-w-none">
          <Link
            href="/book"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 h-13 px-8 bg-neutral-950 text-white text-sm font-medium tracking-wider uppercase hover:bg-neutral-800 transition-all active:scale-[0.99] min-h-[48px]"
          >
            <span>Book your slot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#experience"
            className="w-full sm:w-auto inline-flex items-center justify-center h-13 px-7 bg-white text-neutral-900 border border-neutral-300 text-sm font-medium tracking-wider uppercase hover:bg-neutral-50 transition-colors min-h-[48px]"
          >
            Discover the experience
          </Link>
        </div>

        <p className="mt-4 text-xs text-neutral-500 font-mono">
          Zero online payment required to reserve. One customer per slot.
        </p>
      </div>
    </section>
  );
}
