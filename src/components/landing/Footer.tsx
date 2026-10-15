import Link from 'next/link';
import { BUSINESS_CONFIG, CONTACT_CONFIG } from '@/config/business';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f2f2f2] border-t border-neutral-300/80 text-neutral-600 py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-300">
          <div className="md:col-span-2">
            <span className="font-editorial text-2xl font-normal tracking-tight text-neutral-950 block mb-3">
              {BUSINESS_CONFIG.brandName}
            </span>
            <p className="text-sm text-neutral-600 max-w-md leading-relaxed mb-4">
              A minimalist, 15-minute quick-relaxation service designed for students and employees at MU. Take a pause, step away, and return to your day feeling refreshed.
            </p>
            <p className="text-xs font-mono text-neutral-500">
              {CONTACT_CONFIG.operatingNotice}
            </p>
          </div>

          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-950 block mb-4">
              Navigation
            </span>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/book" className="hover:text-neutral-950 transition-colors">
                  Book a Slot
                </Link>
              </li>
              <li>
                <Link href="/#experience" className="hover:text-neutral-950 transition-colors">
                  The Experience
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-neutral-950 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-neutral-950 transition-colors">
                  Terms of Booking
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-950 block mb-4">
              Operations & Admin
            </span>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-neutral-500 block text-xs">Standard Rate</span>
                <span className="font-mono text-neutral-800">
                  {BUSINESS_CONFIG.currencySymbol}{BUSINESS_CONFIG.priceInr} / 15 min
                </span>
              </li>
              <li className="pt-2">
                <span className="text-neutral-500 block text-xs">Payment</span>
                <span className="text-xs text-neutral-800">Pay physically after massage</span>
              </li>
              <li className="pt-3">
                <Link
                  href="/admin"
                  className="font-mono text-xs text-neutral-500 hover:text-neutral-950 underline underline-offset-4"
                >
                  Founder Dashboard →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-neutral-500 gap-4">
          <p>© {currentYear} {BUSINESS_CONFIG.brandName}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms & Cancellation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
