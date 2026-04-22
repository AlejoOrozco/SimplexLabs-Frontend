import { ReactNode } from 'react';
import { AppShell } from '@/components/layouts/app-shell';
import { requireSuperAdminSession } from '@/lib/auth/guards';

export default async function AdminLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  await requireSuperAdminSession();
  return <AppShell showAdminNav>{children}</AppShell>;
}
