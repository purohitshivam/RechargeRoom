import { Calendar, Clock, CreditCard } from 'lucide-react';
import { BUSINESS_CONFIG } from '@/config/business';

export function SimpleByDesign() {
  const steps = [
    {
      step: '01',
      icon: Calendar,
      title: 'Choose your time',
      description:
        'Select a date and any free 15-minute slot that aligns with your schedule. Only available slots are shown.',
    },
    {
      step: '02',
      icon: Clock,
      title: 'Reserve in seconds',
      description:
        'Enter your basic details to hold your spot. No advance online payment, wallet linking, or app download required.',
    },
    {
      step: '03',
      icon: CreditCard,
      title: 'Show up, reset & pay',
      description: `Arrive 2 minutes before your time, enjoy your 15-minute massage, and pay ${BUSINESS_CONFIG.currencySymbol}${BUSINESS_CONFIG.priceInr} in person after your session.`,
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3 block">
            Effortless Flow
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950 mb-4">
            Simple by design.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg">
            Zero friction from discovery to confirmation. Reserving your break takes less than 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="p-8 border border-neutral-200 bg-white relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs text-neutral-400 tracking-widest">
                      STEP {s.step}
                    </span>
                    <Icon className="w-5 h-5 text-neutral-800" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-editorial text-2xl font-normal text-neutral-950 mb-3">
                    {s.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
            Pay physically via Cash or UPI after service delivery
          </p>
        </div>
      </div>
    </section>
  );
}
