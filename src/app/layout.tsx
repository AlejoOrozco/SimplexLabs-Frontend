import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppProviders } from '@/components/layouts/providers';
import './globals.css';

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
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
