'use client';

import { ReactNode } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { Sidebar } from '@/components/layout/Sidebar';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { AppShellSession, SessionShellStateProvider } from '@/components/layouts/app-shell.client';

interface AppShellProps {
  children: ReactNode;
  session: AppShellSession;
}

export function AppShell({ children, session }: AppShellProps): JSX.Element {
  return (
    <SessionShellStateProvider session={session}>
      {({ isSidebarCollapsed, toggleSidebarCollapsed }) => (
        <div className="h-screen min-w-[1024px] overflow-hidden bg-surface-overlay text-text-primary">
          <div className="flex h-full">
            <Sidebar
              isAdmin={session.isAdmin}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapsed={toggleSidebarCollapsed}
              session={{
                userName: session.userName,
                userEmail: session.userEmail,
                companyName: session.companyName,
                subscriptionPlan: session.subscriptionPlan,
              }}
            />
            <main className="min-w-0 flex-1 overflow-y-auto">
              <ErrorBoundary>
                <PageShell>{children}</PageShell>
              </ErrorBoundary>
            </main>
          </div>
          <OnboardingTour />
        </div>
      )}
    </SessionShellStateProvider>
  );
}
