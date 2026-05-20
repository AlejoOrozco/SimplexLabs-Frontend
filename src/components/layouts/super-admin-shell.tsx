import { ReactNode } from 'react';
import { AppShell } from '@/components/layouts/app-shell';
import { requireSuperAdminSession } from '@/lib/auth/guards';
import { fullName } from '@/lib/utils/format';

export async function SuperAdminShell({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const session = await requireSuperAdminSession();
  const user = session.user;
  const userName =
    user && typeof user.firstName === 'string' && typeof user.lastName === 'string'
      ? fullName(user)
      : 'Admin';

  return (
    <AppShell
      session={{
        isAdmin: true,
        userName,
        userEmail: null,
        companyName: null,
        subscriptionPlan: null,
      }}
    >
      {children}
    </AppShell>
  );
}
