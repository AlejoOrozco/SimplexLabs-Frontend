'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ModalProvider } from '@/context/modal-context';
import { eventBus } from '@/lib/realtime/event-bus';
import { getSocket } from '@/lib/realtime/socket';
import { notify } from '@/lib/toast';

const POST_LOGIN_REDIRECT_KEY = 'simplex_post_login_redirect';

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

export function AppProviders({ children }: { children: ReactNode }): JSX.Element {
  const [queryClient] = useState(createQueryClient);
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const socket = getSocket();
    const offSession = eventBus.on('session:expired', () => setSessionExpired(true));
    const offForbidden = eventBus.on('auth:forbidden', () => {
      notify.error("You don't have permission to do this");
    });
    return () => {
      offSession();
      offForbidden();
      socket.disconnect();
    };
  }, []);

  const modal = useMemo(() => {
    if (!sessionExpired) return null;
    return (
      <Dialog open>
        <DialogContent
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-text-secondary" />
              Your session has expired
            </DialogTitle>
            <DialogDescription>
              For your security, you&apos;ve been logged out after a period of inactivity.
            </DialogDescription>
          </DialogHeader>
          <Button
            type="button"
            className="mt-2 w-full"
            onClick={() => {
              const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
              sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, currentUrl);
              router.replace('/login');
            }}
          >
            Log in again
          </Button>
        </DialogContent>
      </Dialog>
    );
  }, [router, sessionExpired]);

  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        {children}
        {modal}
      </ModalProvider>
      <Toaster
        position="bottom-right"
        closeButton
        visibleToasts={3}
        toastOptions={{ className: 'border border-border-default bg-surface-page text-text-primary' }}
      />
    </QueryClientProvider>
  );
}
