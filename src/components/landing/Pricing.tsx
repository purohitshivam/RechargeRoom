import Link from 'next/link';
import { Check } from 'lucide-react';
import { BUSINESS_CONFIG } from '@/config/business';

export function Pricing() {
  const inclusions = [
    '15 minutes of focused head, neck, and shoulder massage',
    'One-on-one session with dedicated practitioner',
    'Tranquil, quiet environment designed for deep mental reset',
    'Zero online payment required to book',
    'Pay ₹249 physically after your massage is finished',
    'Seamless calendar export (.ics and Google Calendar)',
  ];

  return (
    <section className="py-20 sm:py-28 border-b border-neutral-200 bg-[#f7f7f7]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3 block">
            Transparent Pricing
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950 mb-3">
            One simple rate.
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base">
            No subscriptions, no hidden convenience fees, and no advance card charges.
          </p>
        </div>

        <div className="bg-white border border-neutral-200/90 p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-8 mb-8 border-b border-neutral-200 gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 block mb-1">
                Standard Session
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl font-normal text-neutral-950">
                15-Minute Recharge
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-5xl sm:text-6xl font-normal text-neutral-950">
                {BUSINESS_CONFIG.currencySymbol}{BUSINESS_CONFIG.priceInr}
              </span>
              <span className="text-sm font-mono text-neutral-500 uppercase">
                / session
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {inclusions.map((inc, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-neutral-900 mt-1 shrink-0" strokeWidth={2} />
                <span className="text-sm text-neutral-700 leading-normal">{inc}</span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-500 font-mono">
              Physical payment collected at venue via UPI or Cash
            </p>
            <Link
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 bg-neutral-950 text-white text-xs sm:text-sm font-medium tracking-wider uppercase hover:bg-neutral-800 transition-colors min-h-[48px]"
            >
              Book your session
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
