import { BUSINESS_CONFIG } from '@/config/business';

export function TheExperience() {
  const parts = [
    {
      number: '01',
      title: 'Head Massage',
      description:
        'Targeted scalp and cranial acupressure designed to alleviate cognitive fatigue from prolonged screen exposure, heavy study blocks, and mental strain.',
      icon: (
        <svg
          className="w-6 h-6 text-neutral-950"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden="true"
        >
          {/* Minimalist Head / Cranial Contour */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c-4.418 0-8 3.358-8 7.5 0 2.455 1.258 4.636 3.2 6.002V19.5a1.5 1.5 0 001.5 1.5h6.6a1.5 1.5 0 001.5-1.5v-2.998c1.942-1.366 3.2-3.547 3.2-6.002C20 6.358 16.418 3 12 3z"
          />
          {/* Pressure wave pulses */}
          <path strokeLinecap="round" d="M9.5 9.5a3.5 3.5 0 015 0" />
          <path strokeLinecap="round" d="M8 12.5a5.5 5.5 0 018 0" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Neck Massage',
      description:
        'Rhythmic release focusing on the suboccipital and cervical muscles, where postural tightness accumulates from looking down at laptops and phones.',
      icon: (
        <svg
          className="w-6 h-6 text-neutral-950"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden="true"
        >
          {/* Minimalist Cervical Neck & Spine Vertebrae Line Art */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 4.5h8M7.5 8.5h9M8.5 12.5h7M9 16.5h6M10 20.5h4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2.5v19"
          />
          <path
            strokeLinecap="round"
            d="M5.5 10c0 4.5 2.5 8.5 6.5 10.5 4-2 6.5-6 6.5-10.5"
          />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Shoulder Massage',
      description:
        'Deliberate pressure across the upper trapezius and shoulder girdle to relieve accumulated tension and restore upright ease to your posture.',
      icon: (
        <svg
          className="w-6 h-6 text-neutral-950"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden="true"
        >
          {/* Minimalist Shoulders & Trapezius Contour Line Art */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6a3 3 0 100-6 3 3 0 000 6z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 19.5v-2.25a6 6 0 016-6h3a6 6 0 016 6v2.25"
          />
          <path
            strokeLinecap="round"
            d="M3 15.5l3-1.5M21 15.5l-3-1.5"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="experience" className="py-20 sm:py-28 border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3 block">
            The 15-Minute Protocol
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4">
            Small break. Different feeling.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed font-normal">
            Every session is structured as a calibrated 15-minute sequence focusing on the three areas that hold everyday physical strain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 border-t border-neutral-200 pt-10">
          {parts.map((p) => (
            <div key={p.number} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-xs text-neutral-400 tracking-widest block">
                    {p.number}
                  </span>
                  {/* Minimalist circular line-art icon */}
                  <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                    {p.icon}
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-neutral-950 mb-3">
                  {p.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 p-6 bg-neutral-100/70 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-700 block mb-1">
              Time Commitment
            </span>
            <p className="text-sm text-neutral-600 font-normal">
              Entire session lasts exactly {BUSINESS_CONFIG.durationMinutes} minutes. No changing clothes, optional non-sticky hair oil/serum, zero disruption to your workday.
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-500 shrink-0">
            Professional · Non-clinical
          </span>
        </div>
      </div>
    </section>
  );
}
