import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
// @ts-ignore: side-effect CSS import
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
  title: 'Staff Portal | Prasynx',
  description: 'Teacher and staff portal for Prasynx. Manage classes, attendance, grades, and communication.',
  manifest: '/manifest.json',
  icons: {
    icon: "/icons/fav.png",       
    shortcut: "/icons/fav.png",
    apple: "/icons/fav.png",
  },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Prasynx' },
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
      <body>
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
          <PreranaAILauncherWrapper role="staff" />
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
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
