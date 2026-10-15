import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRepository } from '@/lib/db';
import { BUSINESS_CONFIG } from '@/config/business';
import { ConfirmationCard } from '@/components/booking/ConfirmationCard';
import { ArrowLeft } from 'lucide-react';

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingConfirmationPage({ params }: ConfirmationPageProps) {
  const { id } = await params;
  const repo = getRepository();
  const booking = await repo.getBookingById(id);

  if (!booking) {
    notFound();
  }

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

          <Link href="/" className="font-editorial text-xl font-medium tracking-tight text-neutral-950">
            {BUSINESS_CONFIG.brandName}
          </Link>

          <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider">
            Booking Confirmed
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 py-12 sm:py-20 flex items-center justify-center">
        <ConfirmationCard booking={booking} />
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-xs font-mono text-neutral-500">
        <p>{BUSINESS_CONFIG.brandName} · Reserved online, paid physically in person</p>
      </footer>
    </div>
  );
}
