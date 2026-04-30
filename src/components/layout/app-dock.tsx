'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Home,
  Info,
  Settings,
  User,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Dock from '@/components/ui/dock';
import { logout as logoutRequest } from '@/lib/api/auth.api';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api/notifications.api';
import type { Notification } from '@/lib/api/endpoints';
import { notify } from '@/lib/toast';
import { formatRelative } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface AppDockProps {
  userName: string;
  userEmail: string | null;
  companyName: string | null;
  subscriptionPlan: string | null;
}

export function AppDock({
  userName,
  userEmail,
  companyName,
  subscriptionPlan,
}: AppDockProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const [accountAnchor, setAccountAnchor] = useState<{ x: number; y: number } | null>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<{ x: number; y: number } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const previousUnreadCount = useRef(0);

  const hasUnreadNotifications = unreadCount > 0;

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

  const handleNavigate = useCallback((href: string): void => {
    setAccountAnchor(null);
    setNotificationAnchor(null);
    router.push(href);
  }, [router]);

  const getNotificationHref = useCallback((notification: Notification): string => {
    const resourceType = notification.resourceType?.toLowerCase();
    const resourceId = notification.resourceId;
    if (!resourceType || !resourceId) return '/notifications';
    if (resourceType.includes('conversation')) return `/inbox/${resourceId}`;
    if (resourceType.includes('appointment')) return '/appointments';
    if (resourceType.includes('order')) return '/orders';
    if (resourceType.includes('payment')) return '/payments';
    return '/notifications';
  }, []);

  const getNotificationIcon = useCallback((notification: Notification): JSX.Element => {
    const normalizedType = notification.type.toLowerCase();
    const normalizedTitle = notification.title.toLowerCase();
    if (normalizedType === 'action_required' || normalizedTitle.includes('needs')) {
      return <CircleAlert className="h-4 w-4 text-warning" />;
    }
    if (normalizedType === 'alert' || normalizedTitle.includes('failed')) {
      return <XCircle className="h-4 w-4 text-error" />;
    }
    if (normalizedTitle.includes('payment') || normalizedTitle.includes('order')) {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
    return <Info className="h-4 w-4 text-info" />;
  }, []);

  const handleOpenNotifications = useCallback(
    async (meta: { rect: DOMRect }): Promise<void> => {
      setAccountAnchor(null);
      setNotificationAnchor((current) => {
        if (current) return null;
        return { x: meta.rect.left + meta.rect.width / 2, y: meta.rect.top };
      });
      await refreshNotifications();
    },
    [refreshNotifications],
  );

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
      router.push(getNotificationHref(notification));
    },
    [getNotificationHref, router],
  );

  const items = useMemo(
    () => [
      {
        label: 'Dashboard',
        icon: <Home size={18} />,
        onClick: () => handleNavigate('/dashboard'),
        className: pathname.startsWith('/dashboard') ? 'border-brand-500 bg-brand-50' : '',
      },
      {
        label: 'Notifications',
        icon: (
          <span className="relative inline-flex">
            <Bell size={18} />
            {hasUnreadNotifications ? (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand-500" aria-hidden />
            ) : null}
          </span>
        ),
        onClick: (meta: { rect: DOMRect }) => {
          void handleOpenNotifications(meta);
        },
        className: notificationAnchor ? 'border-brand-500 bg-brand-50' : '',
      },
      {
        label: 'Account',
        icon: <User size={18} />,
        onClick: (meta: { rect: DOMRect }) => {
          setAccountAnchor((current) =>
            current ? null : { x: meta.rect.left + meta.rect.width / 2, y: meta.rect.top },
          );
        },
        className: accountAnchor ? 'border-brand-500 bg-brand-50' : '',
      },
      {
        label: 'Settings',
        icon: <Settings size={18} />,
        onClick: () => handleNavigate('/dashboard/settings'),
        className: pathname.startsWith('/dashboard/settings') ? 'border-brand-500 bg-brand-50' : '',
      },
    ],
    [
      accountAnchor,
      handleNavigate,
      handleOpenNotifications,
      hasUnreadNotifications,
      notificationAnchor,
      pathname,
    ],
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
      router.replace('/login');
    } finally {
      setIsSigningOut(false);
      setAccountAnchor(null);
    }
  };

  return (
    <>
      <Dock items={items} panelHeight={68} baseItemSize={50} magnification={70} />

      {accountAnchor ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-dropdown bg-transparent"
            onClick={() => setAccountAnchor(null)}
            aria-label="Close account menu"
          />
          <div
            className="fixed z-modal min-w-[280px] -translate-x-1/2 rounded-lg border border-border-default bg-surface-page p-3 shadow-lg"
            style={{
              left: `${accountAnchor.x}px`,
              top: `${accountAnchor.y}px`,
              transform: 'translate(-50%, calc(-100% - 12px))',
            }}
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">{userName}</p>
              <p className="text-xs text-text-secondary">{userEmail ?? 'No email available'}</p>
              <p className="text-xs text-text-secondary">{companyName ?? 'No company assigned'}</p>
              <span className="inline-flex rounded-full border border-border-default px-2 py-0.5 text-xs text-text-primary">
                {subscriptionPlan ?? 'Plan unavailable'}
              </span>
            </div>
            <div className="my-3 h-px bg-border-default" />
            <Link
              href="/settings/company"
              className="block rounded-md px-2 py-1.5 text-sm text-text-primary transition-colors hover:bg-neutral-100"
              onClick={() => setAccountAnchor(null)}
            >
              Profile settings
            </Link>
            <div className="my-3 h-px bg-border-default" />
            <button
              type="button"
              onClick={() => void handleLogout()}
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
      ) : null}

      <AnimatePresence>
        {notificationAnchor ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-dropdown bg-transparent"
              onClick={() => setNotificationAnchor(null)}
              aria-label="Close notifications panel"
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24, mass: 0.6 }}
              className="fixed z-modal w-[380px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-border-default bg-surface-page shadow-lg"
              style={{
                left: `${notificationAnchor.x}px`,
                top: `${notificationAnchor.y}px`,
                transform: 'translate(-50%, calc(-100% - 12px))',
              }}
            >
              <div className="flex items-center justify-between border-b border-border-default px-3 py-2">
                <p className="text-sm font-medium text-text-primary">Notifications</p>
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    className="text-xs text-text-brand underline"
                    onClick={() => void handleMarkAllRead()}
                  >
                    Mark all as read
                  </button>
                ) : null}
              </div>

              <div className="max-h-[480px] overflow-y-auto p-2">
                {isNotificationsLoading ? (
                  <div className="p-3 text-sm text-text-secondary">Loading notifications...</div>
                ) : null}
                {!isNotificationsLoading && notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                    <Bell className="h-6 w-6 text-text-secondary" />
                    <p className="text-sm font-medium text-text-primary">You&apos;re all set</p>
                    <p className="text-xs text-text-secondary">No new notifications</p>
                  </div>
                ) : null}
                {!isNotificationsLoading && notifications.length > 0 ? (
                  <ul className="space-y-2">
                    {notifications.map((notification) => (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() => void handleNotificationClick(notification)}
                          className={cn(
                            'relative w-full rounded-md border border-border-default p-3 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200',
                            notification.isRead ? 'bg-surface-page' : 'bg-surface-raised',
                          )}
                        >
                          {!notification.isRead ? (
                            <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
                          ) : null}
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5">{getNotificationIcon(notification)}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                              <p className="mt-0.5 text-sm text-text-secondary">{notification.body}</p>
                              <p className="mt-1 inline-flex items-center gap-1 text-xs text-text-secondary">
                                <Clock3 className="h-3 w-3" />
                                {formatRelative(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
