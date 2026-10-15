import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BUSINESS_CONFIG } from '@/config/business';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span className="font-editorial text-xl font-medium text-neutral-950">
            {BUSINESS_CONFIG.brandName}
          </span>
          <span className="font-mono text-xs text-neutral-400 uppercase">Terms</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-12 sm:py-20">
        <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-2 block">
          Operating Standards
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-neutral-950 mb-6">
          Terms of Booking
        </h1>
        <p className="text-xs font-mono text-neutral-500 mb-10 pb-4 border-b border-neutral-200">
          Last updated: October 2026 · Standard terms for Recharge Room sessions
        </p>

        <div className="space-y-8 text-sm text-neutral-700 leading-relaxed font-normal">
          <section>
            <h2 className="font-editorial text-xl text-neutral-950 mb-2 font-normal">
              1. Nature of the Service
            </h2>
            <p>
              Recharge Room provides a dedicated 15-minute head, neck, and shoulder massage designed to help campus and workplace individuals take a restorative break. This is a wellness and relaxation service. It is strictly non-clinical and is not intended to diagnose, treat, cure, or manage any medical disorder, musculoskeletal injury, or chronic medical condition.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-xl text-neutral-950 mb-2 font-normal">
              2. Fixed Pricing & Physical Payment
            </h2>
            <p>
              Sessions are priced at a flat rate of {BUSINESS_CONFIG.currencySymbol}{BUSINESS_CONFIG.priceInr} for 15 minutes. No advance payment or card authorization is collected online. Customers agree to pay the session fee in person immediately after their massage via UPI or cash.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-xl text-neutral-950 mb-2 font-normal">
              3. Arrival & Punctuality
            </h2>
            <p>
              Because each session occupies an exact 15-minute schedule block, punctuality is essential. Please arrive 2 minutes prior to your reserved slot. Late arrivals will receive the remainder of their designated slot to preserve timing for subsequent campus guests.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-xl text-neutral-950 mb-2 font-normal">
              4. Cancellation & Respect for Slots
            </h2>
            <p>
              Because only one customer is served per 15-minute slot, please notify the team or cancel promptly if your schedule changes so that fellow students or colleagues can utilize the opening.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-xs font-mono text-neutral-500">
        {BUSINESS_CONFIG.brandName} · Terms of Booking
      </footer>
    </div>
  );
}
