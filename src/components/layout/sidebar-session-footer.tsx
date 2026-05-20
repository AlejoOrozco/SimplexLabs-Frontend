'use client';

import Link from 'next/link';
import { Bell, User, UserCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarAccountFloatingPanel } from '@/components/layout/sidebar-account-floating-panel';
import { sidebarFooterControlClass } from '@/components/layout/sidebar-footer-nav-classes';
import { SidebarNotificationsFloatingPanel } from '@/components/layout/sidebar-notifications-floating-panel';
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
import { clampSidebarPanelLeft, type SidebarPanelAnchor } from '@/lib/layout/sidebar-panel-anchor';
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
  const pathname = usePathname();
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
  const isProfileActive = pathname === profileHref || pathname.startsWith(`${profileHref}/`);
  const footerClass = (isActive: boolean): string => sidebarFooterControlClass(isCollapsed, isActive);

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

  const closePanels = useCallback((): void => {
    setAccountAnchor(null);
    setNotificationAnchor(null);
  }, []);

  const handleOpenNotifications = useCallback(
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

  const handleToggleAccount = useCallback((rect: DOMRect): void => {
    setNotificationAnchor(null);
    setAccountAnchor((current) => (current ? null : clampSidebarPanelLeft(rect, 280)));
  }, []);

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
      <div className="mt-3 border-t border-border-default pt-3">
        <p className={cn('mb-2 px-3 text-xs font-medium text-text-secondary', isCollapsed ? 'sr-only' : '')}>
          Account
        </p>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            data-tour="sidebar-notifications"
            title={isCollapsed ? 'Notifications' : undefined}
            aria-expanded={Boolean(notificationAnchor)}
            className={footerClass(Boolean(notificationAnchor))}
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              void handleOpenNotifications(rect);
            }}
          >
            <span className="relative inline-flex shrink-0">
              <Bell size={18} aria-hidden />
              {hasUnreadNotifications ? (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand-500" aria-hidden />
              ) : null}
            </span>
            {!isCollapsed ? <span>Notifications</span> : null}
            {isCollapsed ? (
              <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-tooltip -translate-y-1/2 rounded-md border border-border-default bg-surface-page px-2 py-1 text-xs text-text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                Notifications
              </span>
            ) : null}
          </button>

          <Link
            href={profileHref}
            title={isCollapsed ? 'Profile' : undefined}
            aria-current={isProfileActive ? 'page' : undefined}
            className={footerClass(isProfileActive)}
            onClick={closePanels}
          >
            <UserCircle size={18} aria-hidden />
            {!isCollapsed ? <span>Profile</span> : null}
            {isCollapsed ? (
              <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-tooltip -translate-y-1/2 rounded-md border border-border-default bg-surface-page px-2 py-1 text-xs text-text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                Profile
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            title={isCollapsed ? 'Account' : undefined}
            aria-expanded={Boolean(accountAnchor)}
            className={footerClass(Boolean(accountAnchor))}
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              handleToggleAccount(rect);
            }}
          >
            <User size={18} aria-hidden />
            {!isCollapsed ? <span>Account</span> : null}
            {isCollapsed ? (
              <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-tooltip -translate-y-1/2 rounded-md border border-border-default bg-surface-page px-2 py-1 text-xs text-text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                Account
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {accountAnchor ? (
        <SidebarAccountFloatingPanel
          anchor={accountAnchor}
          profileHref={profileHref}
          resolvedUserName={resolvedUserName}
          resolvedUserEmail={resolvedUserEmail}
          resolvedCompanyName={resolvedCompanyName}
          subscriptionPlan={subscriptionPlan}
          isSigningOut={isSigningOut}
          onRequestClose={() => setAccountAnchor(null)}
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
