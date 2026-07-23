import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Job Provider Portal | Prasunet',
  description: 'Post part-time job opportunities for students, staff, and parents across educational institutions.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6D4CFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
