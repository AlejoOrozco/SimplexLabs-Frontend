'use client';

import { useCallback, useEffect, useRef } from 'react';
import * as authApi from '@/lib/api/auth.api';
import { useIdleTimer } from '@/lib/hooks/use-idle-timer';
import { eventBus } from '@/lib/realtime/event-bus';
import { notify } from '@/lib/toast';

const WARNING_AFTER_MS = 10 * 60 * 1000;
const EXPIRES_AFTER_MS = 14 * 60 * 1000;

export function useSession(enabled = true): void {
  const warningToastId = useRef<string | number | null>(null);
  const resetRef = useRef<(() => void) | null>(null);

  const dismissWarning = useCallback((): void => {
    if (!warningToastId.current) return;
    notify.dismiss(warningToastId.current);
    warningToastId.current = null;
  }, []);

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      await authApi.refresh();
      dismissWarning();
      notify.success('Session refreshed');
      resetRef.current?.();
    } catch {
      dismissWarning();
      eventBus.emit('session:expired', { reason: 'refresh_failed' });
    }
  }, [dismissWarning]);

  const onWarn = useCallback((): void => {
    warningToastId.current = notify.warning('Your session will expire soon', {
      description: 'Move your mouse to stay logged in.',
      duration: Number.POSITIVE_INFINITY,
      action: {
        label: 'Stay logged in',
        onClick: () => {
          void refreshSession();
        },
      },
    });
  }, [refreshSession]);

  const onExpire = useCallback((): void => {
    dismissWarning();
    eventBus.emit('session:expired', { reason: 'idle_timeout' });
  }, [dismissWarning]);

  const onBecomeActiveAfterWarning = useCallback((): void => {
    void refreshSession();
  }, [refreshSession]);

  const { reset } = useIdleTimer({
    warningAfterMs: WARNING_AFTER_MS,
    expiresAfterMs: EXPIRES_AFTER_MS,
    onWarn,
    onExpire,
    onBecomeActiveAfterWarning,
    enabled,
  });
  resetRef.current = reset;

  useEffect(() => {
    if (!enabled) return;

    const offSessionExpired = eventBus.on('session:expired', () => {
      dismissWarning();
    });

    return () => {
      offSessionExpired();
      dismissWarning();
    };
  }, [dismissWarning, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const off = eventBus.on('socket:connected', () => {
      reset();
    });
    return () => off();
  }, [enabled, reset]);
}
