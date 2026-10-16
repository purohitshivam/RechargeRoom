export function MadeForYourDay() {
  const useCases = [
    {
      category: 'For MU Students',
      headline: 'Between lectures & project marathons',
      body: 'Instead of spending a 20-minute gap scrolling on a bench, step into quiet calm. Reset your focus and head into your next class feeling lucid.',
    },
    {
      category: 'For MU Employees',
      headline: 'Midday relief during demanding workdays',
      body: 'Long hours at desks, grading papers, or back-to-back meetings take a silent physical toll. Take 15 minutes to release neck stiffness before the afternoon rush.',
    },
    {
      category: 'For Visitors & Campus Community',
      headline: 'When you simply need to pause',
      body: 'A dedicated sanctuary within campus boundaries. When energy dips or physical fatigue peaks, recharge on your own terms with effortless scheduling.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-b border-neutral-200 bg-[#f7f7f7]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-xl mb-16">
          <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3 block">
            Contextual Purpose
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4">
            Made for your day.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg font-normal">
            Purposefully created for the rhythms of academic and workplace life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {useCases.map((u, i) => (
            <div
              key={i}
              className="bg-white p-7 sm:p-8 border border-neutral-200/90 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs tracking-wider uppercase text-neutral-500 block mb-4 pb-2 border-b border-neutral-100 font-medium">
                  {u.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold text-neutral-950 mb-3 leading-snug">
                  {u.headline}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-normal">{u.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
