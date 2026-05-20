'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface PageMetaState {
  title?: string;
  description?: string;
}

interface PageMetaContextValue {
  meta: PageMetaState;
  setMeta: (meta: PageMetaState) => void;
}

const PageMetaContext = createContext<PageMetaContextValue | null>(null);

export function PageMetaProvider({ children }: { children: ReactNode }): JSX.Element {
  const [meta, setMetaState] = useState<PageMetaState>({});
  const setMeta = useCallback((next: PageMetaState) => {
    setMetaState(next);
  }, []);

  const value = useMemo(() => ({ meta, setMeta }), [meta, setMeta]);

  return <PageMetaContext.Provider value={value}>{children}</PageMetaContext.Provider>;
}

export function usePageMetaState(): PageMetaContextValue {
  const ctx = useContext(PageMetaContext);
  if (!ctx) {
    throw new Error('usePageMetaState must be used within PageMetaProvider');
  }
  return ctx;
}

/** Sets the app shell header title and description for the current page. Renders nothing. */
export function PageMeta({ title, description }: PageMetaState): null {
  const { setMeta } = usePageMetaState();

  useLayoutEffect(() => {
    setMeta({ title, description });
    return () => setMeta({});
  }, [title, description, setMeta]);

  return null;
}
