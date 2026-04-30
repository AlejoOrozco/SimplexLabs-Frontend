import { ReactNode } from 'react';
import { AppShell } from '@/components/layouts/app-shell';
import { requireClientSession } from '@/lib/auth/guards';
import { fullName } from '@/lib/utils/format';

export default async function ClientLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const session = await requireClientSession();
  const user = session.user;
  const userName =
    user && typeof user.firstName === 'string' && typeof user.lastName === 'string'
      ? fullName(user)
      : 'User';

  return (
    <AppShell
      session={{
        isAdmin: session.role === 'SUPER_ADMIN',
        userName,
        userEmail: null,
        companyName: session.companyId,
        subscriptionPlan: null,
      }}
    >
      {children}
    </AppShell>
  );
}
