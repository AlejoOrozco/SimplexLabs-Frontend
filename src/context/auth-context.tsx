'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '@/lib/api/auth.api';
import { setAuthFailureHandler } from '@/lib/api/client';
import { POST_LOGIN_REDIRECT_KEY } from '@/lib/auth/post-login-redirect';
import { getDefaultAuthenticatedHomePath } from '@/lib/auth/session-role-utils';
import { writeAuthProfile } from '@/lib/auth/profile-cache';
import type { LoginDto } from '@/lib/schemas/auth.schema';
import type { AuthenticatedUser } from '@/lib/types';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthenticatedUser | null) => void;
  refetchMe: () => Promise<void>;
  /**
   * Bumps the session-hydration generation so an in-flight `/auth/me` from bootstrap
   * cannot clear the user after password/OAuth login (or overlap logout).
   */
  bumpSessionHydrationGeneration: () => void;
}

export interface AuthPermissionHelpers {
  can: (permission: string) => boolean;
  canAny: (...permissions: string[]) => boolean;
  canAll: (...permissions: string[]) => boolean;
  isSimplexAdmin: boolean;
  isSimplexStaff: boolean;
  isCompanyAdmin: boolean;
  isCompanyStaff: boolean;
  /** True when the signed-in company is the platform owner tenant (`company.isPlatformOwner`). */
  isPlatformOwner: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasAttemptedHydration = useRef<boolean>(false);
  const sessionHydrationGenerationRef = useRef<number>(0);

  const bumpSessionHydrationGeneration = useCallback((): void => {
    sessionHydrationGenerationRef.current += 1;
  }, []);

  const clearSession = useCallback((): void => {
    setUser(null);
  }, []);

  const hydrate = useCallback(async (): Promise<void> => {
    const startGen = sessionHydrationGenerationRef.current;
    try {
      const me = await authApi.getMe();
      if (sessionHydrationGenerationRef.current !== startGen) return;
      setUser(me);
    } catch {
      if (sessionHydrationGenerationRef.current !== startGen) return;
      setUser(null);
    } finally {
      if (sessionHydrationGenerationRef.current === startGen) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (hasAttemptedHydration.current) return;
    hasAttemptedHydration.current = true;
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    setAuthFailureHandler(() => {
      clearSession();
    });
    return () => setAuthFailureHandler(null);
  }, [clearSession]);

  const login = useCallback<AuthContextValue['login']>(
    async (dto) => {
      bumpSessionHydrationGeneration();
      try {
        const authed = await authApi.login(dto);
        setUser(authed);
        writeAuthProfile(authed);
        const redirectTo =
          typeof window !== 'undefined' ? sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY) : null;
        if (redirectTo) {
          sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
          router.replace(redirectTo);
          router.refresh();
          return;
        }
        router.replace(getDefaultAuthenticatedHomePath(authed.roleName));
        router.refresh();
      } finally {
        setIsLoading(false);
      }
    },
    [bumpSessionHydrationGeneration, router],
  );

  const logout = useCallback<AuthContextValue['logout']>(async () => {
    bumpSessionHydrationGeneration();
    try {
      await authApi.logout();
    } finally {
      clearSession();
      router.replace('/login');
    }
  }, [bumpSessionHydrationGeneration, clearSession, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      setUser,
      refetchMe: hydrate,
      bumpSessionHydrationGeneration,
    }),
    [user, isLoading, login, logout, hydrate, bumpSessionHydrationGeneration],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue & AuthPermissionHelpers {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return useMemo(
    () => ({
      ...context,
      can: (permission: string) => context.user?.permissions?.includes(permission) ?? false,
      canAny: (...permissions: string[]) =>
        permissions.some((p) => context.user?.permissions?.includes(p) ?? false),
      canAll: (...permissions: string[]) =>
        permissions.every((p) => context.user?.permissions?.includes(p) ?? false),
      isSimplexAdmin: context.user?.roleName === 'SUPER_ADMIN',
      isSimplexStaff: context.user?.roleName === 'SIMPLEX_STAFF',
      isCompanyAdmin: context.user?.roleName === 'COMPANY_ADMIN',
      isCompanyStaff: context.user?.roleName === 'COMPANY_STAFF',
      isPlatformOwner: context.user?.company?.isPlatformOwner ?? false,
    }),
    [context],
  );
}
