import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from './i18n/LanguageProvider';
import { AuthProvider } from './contexts/AuthContext';

import PreranaAILauncherWrapper from './lib/prerana-ai/PreranaAILauncherWrapper';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Prasunet ERP | School Operating System',
  description: 'Enterprise-grade school management platform. Manage students, staff, academics, finance, and campus operations.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Prasunet' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#6D4CFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icons/icon-512.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-512.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Prasunet" />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
          <PreranaAILauncherWrapper role="management" />
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
