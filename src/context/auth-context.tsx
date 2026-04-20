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
import type { LoginDto, RegisterDto } from '@/lib/schemas/auth.schema';
import type { AuthenticatedUser } from '@/lib/types';
import { Role } from '@/lib/types';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthenticatedUser | null) => void;
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasAttemptedHydration = useRef<boolean>(false);

  const clearSession = useCallback((): void => {
    setUser(null);
  }, []);

  const hydrate = useCallback(async (): Promise<void> => {
    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
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
      router.replace('/login');
    });
    return () => setAuthFailureHandler(null);
  }, [clearSession, router]);

  const login = useCallback<AuthContextValue['login']>(
    async (dto) => {
      const authed = await authApi.login(dto);
      setUser(authed);
      router.replace('/dashboard');
    },
    [router],
  );

  const register = useCallback<AuthContextValue['register']>(
    async (dto) => {
      const authed = await authApi.register(dto);
      setUser(authed);
      router.replace('/dashboard');
    },
    [router],
  );

  const logout = useCallback<AuthContextValue['logout']>(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      router.replace('/login');
    }
  }, [clearSession, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      isAdmin: user?.role === Role.SUPER_ADMIN,
      login,
      register,
      logout,
      setUser,
      refetchMe: hydrate,
    }),
    [user, isLoading, login, register, logout, hydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
