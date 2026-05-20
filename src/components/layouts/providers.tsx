'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import { AccountDeactivatedModalRoot } from '@/components/auth/AccountDeactivatedModal';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ModalProvider } from '@/context/modal-context';
import { POST_LOGIN_REDIRECT_KEY } from '@/lib/auth/post-login-redirect';
import { eventBus } from '@/lib/realtime/event-bus';
import { getSocket } from '@/lib/realtime/socket';
import { notify } from '@/lib/toast';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10_000,
        gcTime: 300_000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}

function SessionExpiredCoordinator(): null {
  const { logout } = useAuth();
  const sessionExpiredToastIdRef = useRef<string | number | null>(null);
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    const dismissSessionToast = (): void => {
      if (sessionExpiredToastIdRef.current == null) return;
      notify.dismiss(sessionExpiredToastIdRef.current);
      sessionExpiredToastIdRef.current = null;
    };

    const offSession = eventBus.on('session:expired', () => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;
      dismissSessionToast();
      sessionExpiredToastIdRef.current = notify.warning('Your session has expired', {
        description: "For your security, you've been logged out after a period of inactivity.",
        duration: 8000,
        closeButton: false,
      });
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, currentUrl);
      void logout().finally(() => {
        isLoggingOutRef.current = false;
      });
    });

    const offDeactivated = (): void => {
      dismissSessionToast();
    };
    window.addEventListener('account-deactivated', offDeactivated);

    return () => {
      offSession();
      window.removeEventListener('account-deactivated', offDeactivated);
      dismissSessionToast();
    };
  }, [logout]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }): JSX.Element {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    const socket = getSocket();

    const offForbidden = eventBus.on('auth:forbidden', () => {
      notify.error("You don't have permission to do this");
    });
    return () => {
      offForbidden();
      socket.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionExpiredCoordinator />
        <ModalProvider>
          {children}
          <AccountDeactivatedModalRoot />
        </ModalProvider>
        <Toaster
          position="bottom-right"
          closeButton
          visibleToasts={3}
          toastOptions={{ className: 'border border-border-default bg-surface-page text-text-primary' }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
