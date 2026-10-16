import React from 'react';

export function TrustHygieneBanner() {
  const trustItems = [
    {
      icon: (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-950 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      ),
      text: 'Urban Company Trained Male Masseur (3+ yrs exp)',
    },
    {
      icon: (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-950 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
          />
        </svg>
      ),
      text: 'Sanitized Sofa Chair & Disposable Towels',
    },
    {
      icon: (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-950 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2.25c-3.15 4.2-6 8.24-6 11.75a6 6 0 1012 0c0-3.51-2.85-7.55-6-11.75z"
          />
        </svg>
      ),
      text: 'Optional Non-Sticky Hair Oil & Serum',
    },
  ];

  return (
    <section
      aria-label="Trust and hygiene standards"
      className="bg-[#f2f2f4] border-y border-neutral-300/80 py-4 sm:py-5 px-4 sm:px-8 transition-colors"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5 md:gap-6 lg:gap-8">
        {trustItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2.5 sm:gap-3 text-neutral-900 w-full md:w-auto justify-start md:justify-center"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-neutral-300/70 flex items-center justify-center shrink-0 shadow-sm">
              {item.icon}
            </div>
            <span className="text-xs sm:text-[13px] font-medium tracking-tight text-neutral-900 leading-snug">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
