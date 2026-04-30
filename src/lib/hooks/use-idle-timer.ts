'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseIdleTimerOptions {
  warningAfterMs: number;
  expiresAfterMs: number;
  onWarn: () => void;
  onExpire: () => void;
  onBecomeActiveAfterWarning: () => void;
  enabled?: boolean;
}

export function useIdleTimer({
  warningAfterMs,
  expiresAfterMs,
  onWarn,
  onExpire,
  onBecomeActiveAfterWarning,
  enabled = true,
}: UseIdleTimerOptions): { reset: () => void } {
  const warningTimeoutRef = useRef<number | null>(null);
  const expiryTimeoutRef = useRef<number | null>(null);
  const hasWarnedRef = useRef(false);

  const clearTimers = useCallback((): void => {
    if (warningTimeoutRef.current) {
      window.clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (expiryTimeoutRef.current) {
      window.clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }
  }, []);

  const reset = useCallback((): void => {
    if (!enabled) return;
    const wasWarned = hasWarnedRef.current;
    hasWarnedRef.current = false;
    clearTimers();

    warningTimeoutRef.current = window.setTimeout(() => {
      hasWarnedRef.current = true;
      onWarn();
    }, warningAfterMs);

    expiryTimeoutRef.current = window.setTimeout(() => {
      onExpire();
    }, expiresAfterMs);

    if (wasWarned) {
      onBecomeActiveAfterWarning();
    }
  }, [clearTimers, enabled, expiresAfterMs, onBecomeActiveAfterWarning, onExpire, onWarn, warningAfterMs]);

  useEffect(() => {
    if (!enabled) return;

    const onActivity = (): void => {
      reset();
    };

    reset();
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('touchstart', onActivity);

    return () => {
      clearTimers();
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('touchstart', onActivity);
    };
  }, [clearTimers, enabled, reset]);

  return { reset };
}
