import { ReactNode } from 'react';
import { SuperAdminShell } from '@/components/layouts/super-admin-shell';

export default async function AdminLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  return <SuperAdminShell>{children}</SuperAdminShell>;
}
