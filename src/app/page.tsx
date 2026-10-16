import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { TrustHygieneBanner } from '@/components/landing/TrustHygieneBanner';
import { TheExperience } from '@/components/landing/TheExperience';
import { MadeForYourDay } from '@/components/landing/MadeForYourDay';
import { SimpleByDesign } from '@/components/landing/SimpleByDesign';
import { Pricing } from '@/components/landing/Pricing';
import { LocationLogistics } from '@/components/landing/LocationLogistics';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';
import { StickyMobileCta } from '@/components/landing/StickyMobileCta';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        {/* Trust & Hygiene Banner immediately below Hero */}
        <TrustHygieneBanner />
        <TheExperience />
        <MadeForYourDay />
        <SimpleByDesign />
        <Pricing />
        {/* Location & Logistics placed just before Final CTA */}
        <LocationLogistics />
        <FinalCta />
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
