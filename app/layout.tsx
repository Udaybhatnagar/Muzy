import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from '@/components/ui/Toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Muzy — Real-time Collaborative Music Rooms',
  description:
    'Create rooms, queue songs, vote together, and let the crowd decide what plays next.',
  keywords: ['music', 'collaborative', 'queue', 'real-time', 'rooms', 'voting'],
  openGraph: {
    title: 'Muzy',
    description: 'Real-time collaborative music rooms.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable}`} style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
