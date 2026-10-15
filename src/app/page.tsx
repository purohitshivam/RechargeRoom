import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { TheExperience } from '@/components/landing/TheExperience';
import { MadeForYourDay } from '@/components/landing/MadeForYourDay';
import { SimpleByDesign } from '@/components/landing/SimpleByDesign';
import { Pricing } from '@/components/landing/Pricing';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';
import { StickyMobileCta } from '@/components/landing/StickyMobileCta';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <TheExperience />
        <MadeForYourDay />
        <SimpleByDesign />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
