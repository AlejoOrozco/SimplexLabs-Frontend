'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/context/auth-context';
import * as authApi from '@/lib/api/auth.api';
import { POST_LOGIN_REDIRECT_KEY } from '@/lib/auth/post-login-redirect';
import { getDefaultAuthenticatedHomePath } from '@/lib/auth/session-role-utils';
import { writeAuthProfile } from '@/lib/auth/profile-cache';

export function OAuthCallback(): JSX.Element {
  const params = useSearchParams();
  const router = useRouter();
  const { setUser, bumpSessionHydrationGeneration } = useAuth();
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
        bumpSessionHydrationGeneration();
        const user = await authApi.handleOAuthCallback(accessToken);
        setUser(user);
        writeAuthProfile(user);
        const redirectTo = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
        if (redirectTo) {
          sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
          router.replace(redirectTo);
          router.refresh();
          return;
        }
        router.replace(getDefaultAuthenticatedHomePath(user.roleName));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'OAuth failed');
        router.replace('/login?error=oauth_failed');
      }
    })();
  }, [params, router, setUser, bumpSessionHydrationGeneration]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-sm">
        {error}
      </main>
    );
  }

  return <LoadingSpinner fullScreen label="Signing you in…" />;
}
