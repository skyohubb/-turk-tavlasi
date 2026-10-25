import type {Metadata, Viewport} from 'next';
import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/800.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import './globals.css';

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
    <html lang="tr" className="dark">
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
