import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, CreditCard, ArrowRight, Compass, ShieldCheck } from 'lucide-react';

export function LocationLogistics() {
  return (
    <section className="py-20 sm:py-28 border-b border-neutral-200 bg-[#f9f9f9]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Column 1: Map / Building Visual Card Placeholder */}
          <div className="relative rounded-2xl overflow-hidden border border-neutral-300 bg-neutral-900 text-white p-8 sm:p-10 shadow-sm flex flex-col justify-between min-h-[380px] sm:min-h-[440px]">
            {/* Background architectural grid pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />

            {/* Top location tag */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-mono tracking-wider uppercase text-neutral-300">
                <Compass className="w-3.5 h-3.5 text-white" />
                <span>Campus Location</span>
              </div>
              <span className="font-mono text-xs text-neutral-400">15-Min Sanctuary</span>
            </div>

            {/* Center Visual: Floor & Building Illustration */}
            <div className="relative z-10 my-8 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-white text-neutral-950 flex items-center justify-center mx-auto sm:mx-0 mb-5 shadow-lg">
                <MapPin className="w-7 h-7 text-neutral-950" />
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">
                Designated Venue
              </div>
              <div className="font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-2">
                Capital Building
              </div>
              <div className="inline-block px-3 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-xs uppercase tracking-wider rounded">
                Level 11 · Suite 1102
              </div>
            </div>

            {/* Bottom info pill */}
            <div className="relative z-10 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Elevator Access Available</span>
              <span className="text-neutral-300 font-medium">Arrive 5 mins prior</span>
            </div>
          </div>

          {/* Column 2: Text & Logistics Points */}
          <div>
            <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3 block">
              Location & Logistics
            </span>

            {/* Primary Copy */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4 leading-tight">
              11th Floor, Capital Building.
            </h2>

            <p className="text-base sm:text-lg text-neutral-600 font-normal leading-relaxed mb-8">
              A private, tranquil corner positioned away from campus hustle. Step out of your lectures or desk work, take the elevator to the 11th floor, and relax immediately.
            </p>

            {/* Sub-points for Operating Hours, Payment Methods, and Arrival */}
            <div className="space-y-6 border-t border-neutral-200 pt-6">
              {/* Point 1: Operating Hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Clock className="w-5 h-5 text-neutral-900" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-neutral-950 mb-1">
                    Operating Hours
                  </h3>
                  <p className="text-sm text-neutral-600 font-normal leading-relaxed">
                    12:00 PM – 8:00 PM · Monday to Saturday
                  </p>
                  <p className="text-xs font-mono text-neutral-400 mt-0.5">
                    Rest & sanitization breaks: 2:30–3:00 PM & 5:30–6:00 PM (Sundays closed)
                  </p>
                </div>
              </div>

              {/* Point 2: Payment Methods */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <CreditCard className="w-5 h-5 text-neutral-900" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-neutral-950 mb-1">
                    Payment Methods
                  </h3>
                  <p className="text-sm text-neutral-600 font-normal leading-relaxed">
                    Pay on-site via UPI or Cash
                  </p>
                  <p className="text-xs font-mono text-neutral-400 mt-0.5">
                    Zero online payment to book · ₹249 flat rate paid only after your session
                  </p>
                </div>
              </div>

              {/* Point 3: Arrival Guidance */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-neutral-900" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-neutral-950 mb-1">
                    Effortless Arrival
                  </h3>
                  <p className="text-sm text-neutral-600 font-normal leading-relaxed">
                    Please arrive 5 minutes before your reserved time. No preparation or change of clothes needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Book CTA */}
            <div className="mt-8 pt-4">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2.5 h-12 px-7 bg-neutral-950 text-white text-xs sm:text-sm font-medium tracking-wider uppercase hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <span>Book Your Slot</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
