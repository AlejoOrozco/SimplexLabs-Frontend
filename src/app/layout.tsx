import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Roboto_Mono } from 'next/font/google';
import { AppProviders } from '@/components/layouts/providers';
import './globals.css';

const interSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'SimplexLabs',
  description: 'SimplexLabs internal dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={`${interSans.variable} ${robotoMono.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
