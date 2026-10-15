import { BUSINESS_CONFIG } from '@/config/business';

export function TheExperience() {
  const parts = [
    {
      number: '01',
      title: 'Head Massage',
      description:
        'Targeted scalp and cranial acupressure designed to alleviate cognitive fatigue from prolonged screen exposure, heavy study blocks, and mental strain.',
    },
    {
      number: '02',
      title: 'Neck Massage',
      description:
        'Rhythmic release focusing on the suboccipital and cervical muscles, where postural tightness accumulates from looking down at laptops and phones.',
    },
    {
      number: '03',
      title: 'Shoulder Massage',
      description:
        'Deliberate pressure across the upper trapezius and shoulder girdle to relieve accumulated tension and restore upright ease to your posture.',
    },
  ];

  return (
    <section id="experience" className="py-20 sm:py-28 border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3 block">
            The 15-Minute Protocol
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950 mb-4">
            Small break. Different feeling.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Every session is structured as a calibrated 15-minute sequence focusing on the three areas that hold everyday physical strain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 border-t border-neutral-200 pt-10">
          {parts.map((p) => (
            <div key={p.number} className="flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-neutral-400 tracking-widest block mb-4">
                  {p.number}
                </span>
                <h3 className="font-editorial text-2xl font-normal text-neutral-950 mb-3">
                  {p.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
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
            <p className="text-sm text-neutral-600">
              Entire session lasts exactly {BUSINESS_CONFIG.durationMinutes} minutes. No changing clothes, no oils in hair, no disruption to your schedule.
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
