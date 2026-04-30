'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useSession } from '@/lib/hooks/use-session';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'simplex_sidebar_collapsed';

export interface AppShellSession {
  isAdmin: boolean;
  userName: string;
  userEmail: string | null;
  companyName: string | null;
  subscriptionPlan: string | null;
}

interface SessionShellStateProps {
  session: AppShellSession;
  children: (state: {
    isSidebarCollapsed: boolean;
    toggleSidebarCollapsed: () => void;
  }) => ReactNode;
}

export function SessionShellStateProvider({ session, children }: SessionShellStateProps): JSX.Element {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  useSession(Boolean(session));

  useEffect(() => {
    const storedValue = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    if (storedValue === '1') {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebarCollapsed = (): void => {
    setIsSidebarCollapsed((previous) => {
      const next = !previous;
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  };

  return <>{children({ isSidebarCollapsed, toggleSidebarCollapsed })}</>;
}
