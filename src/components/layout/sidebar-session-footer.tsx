'use client';

import { MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { SidebarAccountFloatingPanel } from '@/components/layout/sidebar-account-floating-panel';
import { SidebarNotificationsFloatingPanel } from '@/components/layout/sidebar-notifications-floating-panel';
import { SidebarProfileAvatar } from '@/components/layout/sidebar-profile-avatar';
import { getMe, logout as logoutRequest } from '@/lib/api/auth.api';
import type { Notification } from '@/lib/api/endpoints';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api/notifications.api';
import { clearAuthProfile } from '@/lib/auth/profile-cache';
import { readSessionRoleFromMePayload } from '@/lib/auth/session-role-utils';
import { useSidebarFooterProfile } from '@/lib/hooks/use-sidebar-footer-profile';
import { getSidebarNotificationHref } from '@/lib/layout/sidebar-notification-href';
import {
  anchorSidebarPanelAboveTrigger,
  clampSidebarPanelLeft,
  type SidebarPanelAnchor,
} from '@/lib/layout/sidebar-panel-anchor';
import { notify } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';

export interface SidebarSessionFooterProps {
  isCollapsed: boolean;
  userName: string;
  userEmail: string | null;
  companyName: string | null;
  subscriptionPlan: string | null;
}

export function SidebarSessionFooter({
  isCollapsed,
  userName,
  userEmail,
  companyName,
  subscriptionPlan,
}: SidebarSessionFooterProps): JSX.Element {
  const router = useRouter();
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const [accountAnchor, setAccountAnchor] = useState<SidebarPanelAnchor | null>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<SidebarPanelAnchor | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const previousUnreadCount = useRef(0);

  const meQuery = useQuery<unknown>({
    queryKey: ['auth', 'me', 'sidebar-footer'],
    queryFn: getMe,
  });

  const { resolvedUserName, resolvedUserEmail, resolvedCompanyName } = useSidebarFooterProfile(meQuery.data, {
    userName,
    userEmail,
    companyName,
  });

  const userRole = readSessionRoleFromMePayload(meQuery.data);
  const hasUnreadNotifications = unreadCount > 0;
  const profileHref = '/settings/company';
  const planSubtitle = subscriptionPlan ?? resolvedCompanyName ?? 'Member';

  const refreshUnreadCount = useCallback(async (): Promise<void> => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // Non-blocking polling failure.
    }
  }, []);

  const refreshNotifications = useCallback(async (): Promise<void> => {
    setIsNotificationsLoading(true);
    try {
      const [nextNotifications, count] = await Promise.all([
        getNotifications(20),
        getUnreadNotificationCount(),
      ]);
      setNotifications(nextNotifications);
      setUnreadCount(count);
    } catch {
      notify.error('Failed to load notifications');
    } finally {
      setIsNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUnreadCount();
    const intervalId = window.setInterval(() => {
      void refreshUnreadCount();
    }, 30_000);
    const onFocus = (): void => {
      void refreshUnreadCount();
      if (notificationAnchor) void refreshNotifications();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [notificationAnchor, refreshNotifications, refreshUnreadCount]);

  useEffect(() => {
    const didCountChange = previousUnreadCount.current !== unreadCount;
    previousUnreadCount.current = unreadCount;
    if (!notificationAnchor || !didCountChange) return;
    void refreshNotifications();
  }, [notificationAnchor, refreshNotifications, unreadCount]);

  const openNotificationsPanel = useCallback(
    async (rect: DOMRect): Promise<void> => {
      setAccountAnchor(null);
      setNotificationAnchor((current) => {
        if (current) return null;
        return clampSidebarPanelLeft(rect, 380);
      });
      await refreshNotifications();
    },
    [refreshNotifications],
  );

  const handleToggleAccount = useCallback(
    (rect: DOMRect): void => {
      setNotificationAnchor(null);
      setAccountAnchor((current) => {
        if (current) return null;
        if (isCollapsed) return clampSidebarPanelLeft(rect, 280);
        return anchorSidebarPanelAboveTrigger(rect);
      });
    },
    [isCollapsed],
  );

  const handleOpenNotificationsFromMenu = useCallback((): void => {
    const trigger = profileTriggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    void openNotificationsPanel(rect);
  }, [openNotificationsPanel]);

  const handleMarkAllRead = useCallback(async (): Promise<void> => {
    try {
      await markAllNotificationsRead();
      setNotifications((previous) => previous.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      notify.error('Failed to mark all notifications as read');
    }
  }, []);

  const handleNotificationClick = useCallback(
    async (notification: Notification): Promise<void> => {
      if (!notification.isRead) {
        await markNotificationRead(notification.id);
      }
      setNotifications((previous) =>
        previous.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((previous) => Math.max(0, previous - (notification.isRead ? 0 : 1)));
      setNotificationAnchor(null);
      router.push(getSidebarNotificationHref(notification, userRole));
    },
    [router, userRole],
  );

  const handleLogout = async (): Promise<void> => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await notify.promise(logoutRequest(), {
        loading: 'Signing out...',
        success: 'Signed out',
        error: (error) => (error instanceof Error ? error.message : 'Failed to sign out'),
      });
      clearAuthProfile();
      router.replace('/login');
    } finally {
      setIsSigningOut(false);
      setAccountAnchor(null);
    }
  };

  return (
    <>
      <div className="shrink-0 border-t border-border-default pt-2">
        <button
          ref={profileTriggerRef}
          type="button"
          title={isCollapsed ? resolvedUserName : undefined}
          aria-expanded={Boolean(accountAnchor)}
          aria-haspopup="menu"
          className={cn(
            'group relative flex w-full items-center rounded-md border border-transparent transition-colors hover:border-border-default hover:bg-surface-overlay',
            isCollapsed ? 'justify-center p-1.5' : 'gap-2.5 p-2',
            accountAnchor ? 'border-border-default bg-surface-overlay' : '',
          )}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            handleToggleAccount(rect);
          }}
        >
          <span className="relative shrink-0">
            <SidebarProfileAvatar size={isCollapsed ? 26 : 30} />
            {hasUnreadNotifications ? (
              <span
                className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-surface-base bg-brand"
                aria-label="Unread notifications"
              />
            ) : null}
          </span>

          {!isCollapsed ? (
            <>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate font-medium leading-tight text-text-primary">
                  {resolvedUserName}
                </span>
                <span className="block truncate text-[11px] leading-tight text-text-secondary">{planSubtitle}</span>
              </span>
              <MoreHorizontal
                size={16}
                className="shrink-0 text-text-secondary"
                aria-hidden
              />
            </>
          ) : null}

          {isCollapsed ? (
            <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-tooltip -translate-y-1/2 rounded-md border border-border-default bg-surface-overlay px-2 py-1 text-[11px] text-text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              {resolvedUserName}
            </span>
          ) : null}
        </button>
      </div>

      {accountAnchor ? (
        <SidebarAccountFloatingPanel
          anchor={accountAnchor}
          profileHref={profileHref}
          resolvedUserName={resolvedUserName}
          resolvedUserEmail={resolvedUserEmail}
          resolvedCompanyName={resolvedCompanyName}
          subscriptionPlan={subscriptionPlan}
          hasUnreadNotifications={hasUnreadNotifications}
          isSigningOut={isSigningOut}
          onRequestClose={() => setAccountAnchor(null)}
          onOpenNotifications={handleOpenNotificationsFromMenu}
          onLogout={() => void handleLogout()}
        />
      ) : null}

      <SidebarNotificationsFloatingPanel
        anchor={notificationAnchor}
        unreadCount={unreadCount}
        isLoading={isNotificationsLoading}
        notifications={notifications}
        onCloseBackdrop={() => setNotificationAnchor(null)}
        onMarkAllRead={() => void handleMarkAllRead()}
        onNotificationClick={(notification) => void handleNotificationClick(notification)}
      />
    </>
  );
}
