import { ReactNode } from 'react';
import { SuperAdminShell } from '@/components/layouts/super-admin-shell';

export default async function DashboardAdminLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  return <SuperAdminShell>{children}</SuperAdminShell>;
}
