import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BUSINESS_CONFIG } from '@/config/business';

export default function PrivacyPage() {
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
          <span className="font-mono text-xs text-neutral-400 uppercase">Policy</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-12 sm:py-20">
        <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-2 block">
          Transparency & Data
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-neutral-950 mb-6">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-neutral-500 mb-10 pb-4 border-b border-neutral-200">
          Last updated: October 2026 · Effective for Recharge Room campus & workplace operations
        </p>

        <div className="space-y-8 text-sm text-neutral-700 leading-relaxed font-normal">
          <section>
            <h2 className="font-editorial text-xl text-neutral-950 mb-2 font-normal">
              1. What Information We Collect
            </h2>
            <p className="mb-2">
              To book a 15-minute relaxation session, we collect strictly necessary details:
            </p>
            <ul className="list-disc list-inside space-y-1 text-neutral-600">
              <li>Full name</li>
              <li>Mobile number (for schedule verification and urgent notices)</li>
              <li>Email address (to issue calendar invites and booking references)</li>
              <li>Affiliation (Student or Employee status and college/department)</li>
              <li>Optional session note (restricted to logistics and seating preference)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-editorial text-xl text-neutral-950 mb-2 font-normal">
              2. What We Explicitly Do NOT Collect
            </h2>
            <p>
              We do not collect payment card numbers, UPI PINs, banking credentials, biometric data, or medical histories. Our optional notes field is strictly for booking coordination and must not be used for submitting sensitive medical diagnoses.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-xl text-neutral-950 mb-2 font-normal">
              3. Purpose of Processing
            </h2>
            <p>
              Your contact information is used solely to maintain slot availability, prevent double bookings, notify you regarding your appointment, and verify attendance when you arrive. We will never sell, rent, or distribute your personal details to third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-xl text-neutral-950 mb-2 font-normal">
              4. Data Retention & Access
            </h2>
            <p>
              Booking logs are securely accessible only by authorized Recharge Room operational staff to verify physical payments and service completion. You may request the removal of your historical booking record at any time by contacting our team.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-xs font-mono text-neutral-500">
        {BUSINESS_CONFIG.brandName} · Privacy Policy
      </footer>
    </div>
  );
}
