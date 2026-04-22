'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { eventBus } from '@/lib/realtime/event-bus';
import { getSocket } from '@/lib/realtime/socket';

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

  useEffect(() => {
    const socket = getSocket();
    const offSession = eventBus.on('session:expired', () => setSessionExpired(true));
    return () => {
      offSession();
      socket.disconnect();
    };
  }, []);

  const modal = useMemo(() => {
    if (!sessionExpired) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-lg font-semibold">Your session expired</h2>
          <a className="mt-4 inline-flex rounded bg-black px-4 py-2 text-white" href="/login">
            Sign in again
          </a>
        </div>
      </div>
    );
  }, [sessionExpired]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {modal}
    </QueryClientProvider>
  );
}
