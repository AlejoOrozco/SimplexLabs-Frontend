'use client';

import Link from 'next/link';
import type { SidebarPanelAnchor } from '@/lib/layout/sidebar-panel-anchor';
import { cn } from '@/lib/utils/cn';

interface SidebarAccountFloatingPanelProps {
  anchor: SidebarPanelAnchor;
  profileHref: string;
  resolvedUserName: string;
  resolvedUserEmail: string | null;
  resolvedCompanyName: string | null;
  subscriptionPlan: string | null;
  isSigningOut: boolean;
  onRequestClose: () => void;
  onLogout: () => void;
}

export function SidebarAccountFloatingPanel({
  anchor,
  profileHref,
  resolvedUserName,
  resolvedUserEmail,
  resolvedCompanyName,
  subscriptionPlan,
  isSigningOut,
  onRequestClose,
  onLogout,
}: SidebarAccountFloatingPanelProps): JSX.Element {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-dropdown bg-transparent"
        onClick={onRequestClose}
        aria-label="Close account menu"
      />
      <div
        className="fixed z-modal min-w-[280px] max-w-[calc(100vw-2rem)] rounded-lg border border-border-default bg-surface-page p-3 shadow-lg"
        style={{ left: `${anchor.left}px`, top: `${anchor.top}px` }}
      >
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text-primary">{resolvedUserName}</p>
          <p className="text-xs text-text-secondary">{resolvedUserEmail ?? 'No email available'}</p>
          <p className="text-xs text-text-secondary">{resolvedCompanyName ?? 'No company assigned'}</p>
          <span className="inline-flex rounded-full border border-border-default px-2 py-0.5 text-xs text-text-primary">
            {subscriptionPlan ?? 'Plan unavailable'}
          </span>
        </div>
        <div className="my-3 h-px bg-border-default" />
        <Link
          href={profileHref}
          className="block rounded-md px-2 py-1.5 text-sm text-text-primary transition-colors hover:bg-neutral-100"
          onClick={onRequestClose}
        >
          Profile settings
        </Link>
        <div className="my-3 h-px bg-border-default" />
        <button
          type="button"
          onClick={onLogout}
          disabled={isSigningOut}
          className={cn(
            'w-full rounded-md px-2 py-1.5 text-left text-sm text-error transition-colors hover:bg-error-light',
            isSigningOut ? 'cursor-not-allowed opacity-70' : '',
          )}
        >
          {isSigningOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </>
  );
}
