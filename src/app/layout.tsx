import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Urban Air Quality Assistant',
    template: '%s | Urban Air Quality Assistant',
  },
  description:
    'An intelligent air quality monitoring and assistance platform for India. Real-time AQI data, AI-powered insights, and environmental intelligence.',
  keywords: [
    'air quality',
    'AQI',
    'pollution',
    'India',
    'CPCB',
    'environmental monitoring',
    'PM2.5',
    'PM10',
  ],
  authors: [{ name: 'Urban Air Quality Assistant Team' }],
  openGraph: {
    title: 'Urban Air Quality Assistant',
    description:
      'Real-time air quality monitoring and AI-powered environmental insights for India',
    type: 'website',
    siteName: 'Urban Air Quality Assistant',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020817' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          'min-h-screen bg-background font-sans antialiased'
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
