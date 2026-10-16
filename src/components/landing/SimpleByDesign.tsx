import { Calendar, Clock, CreditCard } from 'lucide-react';
import { BUSINESS_CONFIG } from '@/config/business';

export function SimpleByDesign() {
  const steps = [
    {
      step: '01',
      icon: Calendar,
      title: 'Choose your time',
      description:
        'Select a date and any free 15-minute slot that aligns with your schedule. Only live, available slots are shown.',
    },
    {
      step: '02',
      icon: Clock,
      title: 'Reserve in seconds',
      description:
        'Enter your name and mobile to hold your spot. Zero advance payment, wallet linking, or app download required.',
    },
    {
      step: '03',
      icon: CreditCard,
      title: 'Show up, reset & pay',
      description: `Arrive 5 minutes early at Capital Building 11th Floor, enjoy your 15-minute massage, and pay ${BUSINESS_CONFIG.currencySymbol}${BUSINESS_CONFIG.priceInr} in person via UPI or cash.`,
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-b border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3 block">
            Effortless Flow
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 font-normal leading-relaxed">
            Zero friction. Reserve your slot in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="p-8 border border-neutral-200 bg-[#fafafa] relative flex flex-col justify-between hover:border-neutral-900 transition-colors group"
              >
                <div>
                  <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-neutral-200">
                    {/* Step numbers with ExtraBold font weight for clear visual hierarchy */}
                    <span className="font-extrabold text-4xl sm:text-5xl text-neutral-950 tracking-tight font-sans">
                      {s.step}
                    </span>
                    <div className="p-2.5 rounded-full bg-white border border-neutral-200 text-neutral-800 group-hover:text-neutral-950 group-hover:border-neutral-900 transition-colors">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-neutral-950 mb-3 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest font-medium">
            Pay physically via Cash or UPI after service delivery
          </p>
        </div>
      </div>
    </section>
  );
}
