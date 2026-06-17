'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SidebarPanelPortalProps {
  children: ReactNode;
}

/** Renders floating sidebar panels on `document.body` so `position: fixed` uses the viewport (not a transformed sidebar ancestor). */
export function SidebarPanelPortal({ children }: SidebarPanelPortalProps): JSX.Element | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
