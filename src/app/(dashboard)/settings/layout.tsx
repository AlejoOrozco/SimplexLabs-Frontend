import { ReactNode } from 'react';
import { AppShell } from '@/components/layouts/app-shell';
import { requireClientSession } from '@/lib/auth/guards';
import { isPlatformOperatorRole } from '@/lib/auth/session-role-utils';
import { fullName } from '@/lib/utils/format';

export default async function DashboardSettingsLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  const session = await requireClientSession();
  const user = session.user;
  const userName =
    user && typeof user.firstName === 'string' && typeof user.lastName === 'string'
      ? fullName(user)
      : 'User';

  return (
    <AppShell
      session={{
        isAdmin: isPlatformOperatorRole(session.role),
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
