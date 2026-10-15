import Link from 'next/link';
import { BUSINESS_CONFIG } from '@/config/business';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#fafafa]/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-editorial text-xl sm:text-2xl font-medium tracking-tight text-neutral-950 group-hover:opacity-80 transition-opacity">
            {BUSINESS_CONFIG.brandName}
          </span>
        </Link>

        <nav className="flex items-center gap-6 sm:gap-8">
          <Link
            href="#experience"
            className="text-xs sm:text-sm text-neutral-600 hover:text-neutral-950 transition-colors uppercase tracking-wider font-mono hidden xs:inline-block"
          >
            The Experience
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center justify-center h-10 px-4 sm:px-5 bg-neutral-950 text-white text-xs sm:text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors"
          >
            Book a Session
          </Link>
        </nav>
      </div>
    </header>
  );
}
