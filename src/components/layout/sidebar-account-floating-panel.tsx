'use client';

import Link from 'next/link';
import { Bell, LogOut, Settings } from 'lucide-react';
import { SidebarPanelPortal } from '@/components/layout/sidebar-panel-portal';
import type { SidebarPanelAnchor } from '@/lib/layout/sidebar-panel-anchor';
import { cn } from '@/lib/utils/cn';

interface SidebarAccountFloatingPanelProps {
  anchor: SidebarPanelAnchor;
  profileHref: string;
  resolvedUserName: string;
  resolvedUserEmail: string | null;
  resolvedCompanyName: string | null;
  accountSubtitle: string;
  hasUnreadNotifications: boolean;
  isSigningOut: boolean;
  onRequestClose: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

function AccountMenuItem({
  children,
  className,
  ...props
}: React.ComponentProps<'button'> & { children: React.ReactNode }): JSX.Element {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-xs text-text-primary transition-colors hover:bg-surface-overlay',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarAccountFloatingPanel({
  anchor,
  profileHref,
  resolvedUserName,
  resolvedUserEmail,
  resolvedCompanyName,
  accountSubtitle,
  hasUnreadNotifications,
  isSigningOut,
  onRequestClose,
  onOpenNotifications,
  onLogout,
}: SidebarAccountFloatingPanelProps): JSX.Element {
  const planLabel = accountSubtitle;
  const placement = anchor.placement ?? 'beside';
  const panelWidth = anchor.width;

  return (
    <SidebarPanelPortal>
      <button
        type="button"
        className="fixed inset-0 z-dropdown bg-transparent"
        onClick={onRequestClose}
        aria-label="Close account menu"
      />
      <div
        role="menu"
        className={cn(
          'fixed z-modal overflow-y-auto rounded-lg border border-border-default bg-surface-overlay p-2 shadow-lg',
          panelWidth ? '' : 'min-w-[280px] max-w-[calc(100vw-2rem)]',
        )}
        style={{
          left: `${anchor.left}px`,
          top: `${anchor.top}px`,
          width: panelWidth ? `${panelWidth}px` : undefined,
          maxHeight: anchor.maxHeight ? `${anchor.maxHeight}px` : 'calc(100vh - 2rem)',
          transform: placement === 'above' ? 'translateY(-100%)' : undefined,
        }}
      >
        <div className="space-y-0.5 px-2 py-1.5">
          <p className="truncate text-xs font-semibold text-text-primary">{resolvedUserName}</p>
          <p className="truncate text-[11px] text-text-secondary">
            {resolvedUserEmail ?? 'No email available'}
          </p>
          {resolvedCompanyName ? (
            <p className="truncate text-[11px] text-text-secondary">{resolvedCompanyName}</p>
          ) : null}
          <span className="mt-1 inline-flex rounded-full border border-border-default px-2 py-0.5 text-[11px] text-text-primary">
            {planLabel}
          </span>
        </div>

        <div className="my-1.5 h-px bg-border-default" />

        <div className="flex flex-col gap-0.5">
          <AccountMenuItem
            data-tour="sidebar-notifications"
            onClick={() => {
              onRequestClose();
              onOpenNotifications();
            }}
          >
            <span className="relative inline-flex shrink-0 text-text-secondary">
              <Bell size={16} aria-hidden />
              {hasUnreadNotifications ? (
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
              ) : null}
            </span>
            <span>Notifications</span>
          </AccountMenuItem>

          <Link
            href={profileHref}
            className="flex items-center gap-2.5 rounded-md px-2 py-2 text-xs text-text-primary transition-colors hover:bg-surface-overlay"
            onClick={onRequestClose}
          >
            <Settings size={16} className="shrink-0 text-text-secondary" aria-hidden />
            <span>Profile settings</span>
          </Link>
        </div>

        <div className="my-1.5 h-px bg-border-default" />

        <AccountMenuItem
          onClick={onLogout}
          disabled={isSigningOut}
          className={cn(
            'text-error hover:bg-error-surface',
            isSigningOut ? 'cursor-not-allowed opacity-70' : '',
          )}
        >
          <LogOut size={16} className="shrink-0" aria-hidden />
          <span>{isSigningOut ? 'Logging out...' : 'Log out'}</span>
        </AccountMenuItem>
      </div>
    </SidebarPanelPortal>
  );
}
