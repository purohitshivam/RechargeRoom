import type { Metadata, Viewport } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import { BUSINESS_CONFIG } from '@/config/business';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rechargeroom.co.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BUSINESS_CONFIG.brandName} | Your 15-Minute Reset`,
    template: `%s | ${BUSINESS_CONFIG.brandName}`,
  },
  description:
    'Take a quick break with a 15-minute head, neck and shoulder massage. Book your slot for ₹249 and pay in person after your session.',
  keywords: [
    'Recharge Room',
    'massage',
    '15 minute massage',
    'campus wellness',
    'workplace relaxation',
    'head neck shoulder massage',
    'quick reset',
  ],
  authors: [{ name: 'Recharge Room' }],
  creator: 'Recharge Room',
  openGraph: {
    title: `${BUSINESS_CONFIG.brandName} | Your 15-Minute Reset`,
    description:
      'Head, neck and shoulder massages designed to fit into your day. Step away for 15 minutes. Come back feeling refreshed.',
    url: siteUrl,
    siteName: BUSINESS_CONFIG.brandName,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BUSINESS_CONFIG.brandName} | Your 15-Minute Reset`,
    description: '15-minute head, neck and shoulder massage. Reserve online for ₹249, pay in person.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#fafafa',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans bg-[#fafafa] text-[#111111]">
        {children}
      </body>
    </html>
  );
}
