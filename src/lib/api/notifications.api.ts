import { apiGet, apiPost } from '@/lib/api/client';
import type { Notification } from '@/lib/api/endpoints';

interface PaginatedNotifications {
  items: Notification[];
  total: number;
  limit: number;
  offset: number;
}

function isPaginatedNotifications(value: unknown): value is PaginatedNotifications {
  if (!value || typeof value !== 'object') return false;
  return 'items' in value && Array.isArray((value as { items?: unknown }).items);
}

export async function getNotifications(limit = 20): Promise<Notification[]> {
  const response = await apiGet<Notification[] | PaginatedNotifications>('/notifications', {
    params: { limit, offset: 0 },
  });
  if (Array.isArray(response)) return response;
  if (isPaginatedNotifications(response)) return response.items;
  return [];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await apiGet<{ count: number } | { unreadCount: number }>('/notifications/unread-count');
  if ('count' in response) return response.count;
  if ('unreadCount' in response) return response.unreadCount;
  return 0;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiPost(`/notifications/mark-read/${notificationId}`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiPost('/notifications/mark-all-read');
}
