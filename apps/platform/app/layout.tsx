import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Prasynx | Education Operating System',
  description: 'Empowering educational institutions with modern, secure, and efficient management solutions. Connect students, parents, teachers, and administrators on one unified platform.',
  metadataBase: new URL('https://prasynx.com'),
  icons: {
    icon: '/fav.png',
    shortcut: '/fav.png',
    apple: '/fav.png',
  },
  openGraph: {
    title: 'Prasynx | Education Operating System',
    description: 'Empowering educational institutions with modern, secure, and efficient management solutions.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `(async()=>{try{const r=await navigator.serviceWorker.getRegistrations();for(let e of r)await e.unregister();const c=await caches.keys();for(let e of c)await caches.delete(e)}catch(e){console.warn("SW cleanup:",e)}})()`
        }} />
      </body>
    </html>
  );
}
