'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Bell, Clock3 } from 'lucide-react';
import type { Notification } from '@/lib/api/endpoints';
import { isAppointmentCallbackNotification } from '@/lib/appointments/callback-utils';
import { SidebarPanelPortal } from '@/components/layout/sidebar-panel-portal';
import type { SidebarPanelAnchor } from '@/lib/layout/sidebar-panel-anchor';
import { SidebarNotificationRowIcon } from '@/components/layout/sidebar-notification-row-icon';
import { formatRelative } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface SidebarNotificationsFloatingPanelProps {
  anchor: SidebarPanelAnchor | null;
  unreadCount: number;
  isLoading: boolean;
  notifications: Notification[];
  onCloseBackdrop: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export function SidebarNotificationsFloatingPanel({
  anchor,
  unreadCount,
  isLoading,
  notifications,
  onCloseBackdrop,
  onMarkAllRead,
  onNotificationClick,
}: SidebarNotificationsFloatingPanelProps): JSX.Element {
  return (
    <AnimatePresence>
      {anchor ? (
        <SidebarPanelPortal>
          <button
            type="button"
            className="fixed inset-0 z-dropdown bg-transparent"
            onClick={onCloseBackdrop}
            aria-label="Close notifications panel"
          />
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24, mass: 0.6 }}
            className="fixed z-modal flex max-h-[min(480px,calc(100vh-2rem))] w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-border-default bg-surface-overlay shadow-lg"
            style={{
              left: `${anchor.left}px`,
              top: `${anchor.top}px`,
              maxHeight: anchor.maxHeight ? `${anchor.maxHeight}px` : undefined,
            }}
          >
            <div className="flex items-center justify-between border-b border-border-default px-3 py-2">
              <p className="text-sm font-medium text-text-primary">Notifications</p>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="text-xs text-text-brand underline"
                  onClick={onMarkAllRead}
                >
                  Mark all as read
                </button>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="p-3 text-sm text-text-secondary">Loading notifications...</div>
              ) : null}
              {!isLoading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <Bell className="h-6 w-6 text-text-secondary" />
                  <p className="text-sm font-medium text-text-primary">You&apos;re all set</p>
                  <p className="text-xs text-text-secondary">No new notifications</p>
                </div>
              ) : null}
              {!isLoading && notifications.length > 0 ? (
                <ul className="space-y-2">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => onNotificationClick(notification)}
                        className={cn(
                          'relative w-full rounded-md border p-3 text-left transition-colors hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus/40',
                          isAppointmentCallbackNotification(notification)
                            ? cn(
                                'border-warning',
                                notification.isRead ? 'bg-warning-surface/70' : 'bg-warning-surface',
                              )
                            : cn(
                                'border-border-default',
                                notification.isRead ? 'bg-surface-sunken' : 'bg-surface-raised',
                              ),
                        )}
                      >
                        {!notification.isRead ? (
                          <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
                        ) : null}
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5">
                            <SidebarNotificationRowIcon notification={notification} />
                          </span>
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
        </SidebarPanelPortal>
      ) : null}
    </AnimatePresence>
  );
}
