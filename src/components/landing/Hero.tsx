import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { BUSINESS_CONFIG } from '@/config/business';

export function Hero() {
  return (
    <section className="relative pt-3 sm:pt-6 pb-14 sm:pb-20 border-b border-neutral-200 overflow-hidden bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hidden SEO heading */}
        <h1 className="sr-only">
          Recharge Room - A 15-minute pause you deserve. 15-minute head, neck and shoulder massage at MU.
        </h1>

        {/* Furlenco-style Hero Banner Section */}
        <div className="relative group rounded-2xl overflow-hidden border border-neutral-200/90 shadow-md bg-neutral-950 transition-all">
          <Link
            href="/book"
            className="block relative w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-neutral-950"
            title="Book Your Session - Recharge Room"
          >
            <Image
              src="/images/hero-banner.jpg"
              alt="A 15-minute pause you deserve! Recharge Room head, neck, and shoulder massage for ₹249"
              width={1024}
              height={571}
              priority
              className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
            />
            {/* Subtle interactive hover highlight */}
            <div className="absolute inset-0 bg-neutral-950/0 group-hover:bg-neutral-950/5 transition-colors pointer-events-none" />
          </Link>

          {/* Furlenco-style Carousel Controls (Left & Right Navigation Arrows) */}
          <Link
            href="/book"
            aria-label="Previous promotion"
            className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </Link>
          <Link
            href="/book"
            aria-label="Next promotion"
            className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 shadow-sm"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </Link>

          {/* Furlenco-style bottom dot indicator */}
          <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 pointer-events-none">
            <span className="w-5 sm:w-7 h-1.5 rounded-full bg-white shadow-sm" />
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white/50" />
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white/50" />
          </div>
        </div>

        {/* Furlenco-style Categories & Highlights Grid directly below banner */}
        <div className="mt-8 sm:mt-12">
          <div className="text-center mb-6 sm:mb-8">
            <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-500 mb-2 block">
              15-Minute Calibrated Relaxation
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-950">
              Quick Tension Release
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto mt-2 font-normal">
              Pick one focused area or mix multiple during your 15-minute slot. Trained masseurs, calibrated acupressure.
            </p>
          </div>

          {/* Category Cards like Furlenco's "Rent Furniture" cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
            <Link
              href="/book"
              className="p-5 sm:p-6 bg-white border border-neutral-200 hover:border-neutral-900 transition-all text-center group flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl block mb-2 sm:mb-3">💆‍♂️</span>
                <div className="text-lg sm:text-xl font-semibold text-neutral-950 group-hover:underline">
                  Head Massage
                </div>
                <p className="text-[11px] font-mono text-neutral-500 mt-1.5 leading-snug font-normal">
                  Cranial acupressure for screen & mental fatigue
                </p>
              </div>
              <div className="mt-4 text-[10px] font-mono uppercase tracking-wider text-neutral-400 group-hover:text-neutral-950 font-medium flex items-center justify-center gap-1">
                <span>Book Slot</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link
              href="/book"
              className="p-5 sm:p-6 bg-white border border-neutral-200 hover:border-neutral-900 transition-all text-center group flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl block mb-2 sm:mb-3">✨</span>
                <div className="text-lg sm:text-xl font-semibold text-neutral-950 group-hover:underline">
                  Neck Massage
                </div>
                <p className="text-[11px] font-mono text-neutral-500 mt-1.5 leading-snug font-normal">
                  Suboccipital release from laptop & phone strain
                </p>
              </div>
              <div className="mt-4 text-[10px] font-mono uppercase tracking-wider text-neutral-400 group-hover:text-neutral-950 font-medium flex items-center justify-center gap-1">
                <span>Book Slot</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link
              href="/book"
              className="p-5 sm:p-6 bg-white border border-neutral-200 hover:border-neutral-900 transition-all text-center group flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl block mb-2 sm:mb-3">🌿</span>
                <div className="text-lg sm:text-xl font-semibold text-neutral-950 group-hover:underline">
                  Shoulder Massage
                </div>
                <p className="text-[11px] font-mono text-neutral-500 mt-1.5 leading-snug font-normal">
                  Trapezius tension relief to restore upright ease
                </p>
              </div>
              <div className="mt-4 text-[10px] font-mono uppercase tracking-wider text-neutral-400 group-hover:text-neutral-950 font-medium flex items-center justify-center gap-1">
                <span>Book Slot</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link
              href="/book"
              className="p-5 sm:p-6 bg-white border border-neutral-200 hover:border-neutral-900 transition-all text-center group flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl block mb-2 sm:mb-3">🧘</span>
                <div className="text-lg sm:text-xl font-semibold text-neutral-950 group-hover:underline">
                  Upper Back
                </div>
                <p className="text-[11px] font-mono text-neutral-500 mt-1.5 leading-snug font-normal">
                  Postural decompression for desk workers & students
                </p>
              </div>
              <div className="mt-4 text-[10px] font-mono uppercase tracking-wider text-neutral-400 group-hover:text-neutral-950 font-medium flex items-center justify-center gap-1">
                <span>Book Slot</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>

          {/* Quick Trust & Location Badges */}
          <div className="mt-10 pt-6 border-t border-neutral-200 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono text-neutral-700">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-950" />
              <span>15 Mins · ₹249 Only</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neutral-950" />
              <span>Capital Building, 11th Floor</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-950" />
              <span>Pay In Person · No Online Payment Required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
