'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/context/auth-context';

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
  redirectTo?: string;
}

// Sends already-authenticated users to the dashboard so they don't see the
// login/register form. Complements the client-side guard in DashboardLayout
// now that middleware no longer performs this check.
export function RedirectIfAuthenticated({
  children,
  redirectTo = '/dashboard',
}: RedirectIfAuthenticatedProps): JSX.Element {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) router.replace(redirectTo);
  }, [isAuthenticated, isLoading, redirectTo, router]);

  if (isLoading || isAuthenticated) {
    return <LoadingSpinner fullScreen />;
  }

  return <>{children}</>;
}
