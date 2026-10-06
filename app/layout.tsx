import type {Metadata, Viewport} from 'next';
import { Cinzel, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['600', '700', '800', '900'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Düşeş: Efsanevi Türk Tavlası',
  description: 'Sedef kakma el işçiliği tahtası, otantik kahvehane atmosferi ve çevrimdışı yapay zeka rakipleriyle modern Türk tavlası oyunu.',
  applicationName: 'Düşeş Tavla',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Düşeş Tavla',
  },
  openGraph: {
    title: 'Düşeş: Efsanevi Türk Tavlası',
    description: 'Sedef kakma el işçiliği tahtası, otantik kahvehane atmosferi ve çevrimdışı yapay zeka rakipleriyle modern Türk tavlası oyunu.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Düşeş: Efsanevi Türk Tavlası',
    description: 'Sedef kakma el işçiliği tahtası, otantik kahvehane atmosferi ve çevrimdışı yapay zeka rakipleriyle modern Türk tavlası oyunu.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1c120c',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="tr" className={`dark ${cinzel.variable} ${plusJakarta.variable}`}>
      <body suppressHydrationWarning className="bg-[#120b07] text-[#e8d7c2] antialiased selection:bg-[#d97706] selection:text-white min-h-screen">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}`,
          }}
        />
      </body>
    </html>
  );
}
