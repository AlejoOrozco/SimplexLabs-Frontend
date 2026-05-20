import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Sora } from 'next/font/google';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { AppProviders } from '@/components/layouts/providers';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'SimplexLabs',
  description: 'SimplexLabs internal dashboard.',
  icons: {
    /** `public/favicon.webp` — copy from `media/favicon/faviconColor.webp` when present, else `colorFavicon.webp`. */
    icon: [{ url: '/favicon.webp', type: 'image/webp' }],
    apple: [{ url: '/favicon.webp', type: 'image/webp' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className={GeistSans.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
