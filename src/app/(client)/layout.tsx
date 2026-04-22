import { ReactNode } from 'react';
import { AppShell } from '@/components/layouts/app-shell';
import { requireClientSession } from '@/lib/auth/guards';

export default async function ClientLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const session = await requireClientSession();
  return <AppShell showAdminNav={session.role === 'SUPER_ADMIN'}>{children}</AppShell>;
}
