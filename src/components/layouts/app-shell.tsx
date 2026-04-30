'use client';

import { ReactNode } from 'react';
import { AppDock } from '@/components/layout/app-dock';
import { PageShell } from '@/components/layout/page-shell';
import { Sidebar } from '@/components/layout/Sidebar';
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
        <div className="min-h-screen min-w-[1024px] bg-surface-overlay text-text-primary">
          <div className="flex min-h-screen">
            <Sidebar
              isAdmin={session.isAdmin}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapsed={toggleSidebarCollapsed}
            />
            <main className="min-h-screen min-w-0 flex-1">
              <ErrorBoundary>
                <PageShell>{children}</PageShell>
              </ErrorBoundary>
            </main>
          </div>
          <AppDock
            userName={session.userName}
            userEmail={session.userEmail}
            companyName={session.companyName}
            subscriptionPlan={session.subscriptionPlan}
          />
        </div>
      )}
    </SessionShellStateProvider>
  );
}
