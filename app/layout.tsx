import type { Metadata, Viewport } from 'next';
import { Archivo, Geist, IBM_Plex_Mono } from 'next/font/google';
import { SiteNav } from '@/components/nav/SiteNav';
import { Footer } from '@/components/Footer';
import { MotionRoot } from '@/components/scroll/MotionRoot';
import { site } from '@/content/site';
import './globals.css';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
});

const geist = Geist({ variable: '--font-geist', subsets: ['latin'], display: 'swap' });

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Tantro — Engineering intelligence into the physical world',
    template: '%s — Tantro',
  },
  description: site.description,
  applicationName: 'Tantro',
  keywords: [
    'industrial automation',
    'OT integration',
    'industrial data',
    'OPC UA',
    'MQTT',
    'computer vision',
    'predictive maintenance',
    'digital twin',
    'physical AI',
    'edge computing',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Tantro',
    title: 'Tantro — Engineering intelligence into the physical world',
    description: site.description,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tantro — Engineering intelligence into the physical world',
    description: site.description,
  },
  icons: { icon: '/tantro-mark.png', apple: '/tantro-logo.png' },
};

export const viewport: Viewport = {
  themeColor: '#090d16',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${geist.variable} ${plexMono.variable}`}>
      <body className="antialiased">
        <SiteNav />
        <MotionRoot />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
