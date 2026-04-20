import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { QueryProvider } from '@/context/query-provider';
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
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
