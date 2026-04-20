'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/context/auth-context';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps): JSX.Element {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) router.replace('/dashboard');
  }, [isAdmin, isLoading, router]);

  if (isLoading || !isAdmin) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
