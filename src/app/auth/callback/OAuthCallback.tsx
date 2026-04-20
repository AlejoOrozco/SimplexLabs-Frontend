'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/context/auth-context';
import * as authApi from '@/lib/api/auth.api';

export function OAuthCallback(): JSX.Element {
  const params = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef<boolean>(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const accessToken =
      params.get('access_token') ??
      (typeof window !== 'undefined'
        ? new URLSearchParams(window.location.hash.replace(/^#/, '')).get('access_token')
        : null);

    if (!accessToken) {
      router.replace('/login?error=oauth_failed');
      return;
    }

    void (async () => {
      try {
        const user = await authApi.handleOAuthCallback(accessToken);
        setUser(user);
        router.replace('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'OAuth failed');
        router.replace('/login?error=oauth_failed');
      }
    })();
  }, [params, router, setUser]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-sm">
        {error}
      </main>
    );
  }

  return <LoadingSpinner fullScreen label="Signing you in…" />;
}
