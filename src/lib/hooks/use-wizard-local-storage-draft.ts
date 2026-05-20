'use client';

import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';

export interface WizardLocalStorageDraftOptions<T> {
  storageKey: string;
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  revive: (raw: unknown) => T | null;
  serialize: (state: T) => unknown;
  /** Applied to the revived draft before replacing state (e.g. URL overrides). */
  mergeHydrated?: (draft: T) => T;
  debounceMs?: number;
  skipHydrate?: boolean;
  /** When true, skips persisting to localStorage (e.g. after successful submit). */
  disablePersist?: boolean;
}

/**
 * Debounced auto-save of wizard state to localStorage (1s default).
 * Hydrates once on mount when {@link WizardLocalStorageDraftOptions.skipHydrate} is false.
 */
export function useWizardLocalStorageDraft<T>({
  storageKey,
  state,
  setState,
  revive,
  serialize,
  mergeHydrated,
  debounceMs = 1000,
  skipHydrate = false,
  disablePersist = false,
}: WizardLocalStorageDraftOptions<T>): void {
  const hydratedRef = useRef(false);
  const mergeRef = useRef(mergeHydrated);
  mergeRef.current = mergeHydrated;

  useEffect(() => {
    if (skipHydrate || hydratedRef.current) return;
    hydratedRef.current = true;
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      let next = revive(parsed);
      if (!next) return;
      const merge = mergeRef.current;
      if (merge) next = merge(next);
      setState(next);
    } catch {
      // ignore corrupt draft
    }
  }, [storageKey, revive, setState, skipHydrate]);

  useEffect(() => {
    if (disablePersist || typeof window === 'undefined') return;
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(serialize(state)));
      } catch {
        // quota / private mode
      }
    }, debounceMs);
    return () => window.clearTimeout(id);
  }, [state, storageKey, debounceMs, serialize, disablePersist]);
}

export function clearWizardLocalStorageDraft(storageKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // ignore
  }
}
