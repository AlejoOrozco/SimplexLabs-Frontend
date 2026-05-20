import type { Notification } from '@/lib/api/endpoints';
import { APPOINTMENT_CALLBACK_NOTIFICATION_RESOURCE } from '@/lib/appointments/callback-utils';
import { adminCompanyWorkspaceHref } from '@/lib/admin/admin-company-workspace-href';
import { isPlatformOperatorRole } from '@/lib/auth/session-role-utils';
import type { SessionRoleName } from '@/lib/types';

export function getSidebarNotificationHref(
  notification: Notification,
  userRole: SessionRoleName | null,
): string {
  const resourceType = notification.resourceType?.toLowerCase() ?? '';
  const resourceId = notification.resourceId;
  if (!resourceId) return '/notifications';
  if (resourceType === APPOINTMENT_CALLBACK_NOTIFICATION_RESOURCE && isPlatformOperatorRole(userRole)) {
    return adminCompanyWorkspaceHref(resourceId, 'appointments');
  }
  if (!resourceType) return '/notifications';
  if (resourceType.includes('conversation')) return `/inbox/${resourceId}`;
  if (resourceType.includes('appointment')) return '/appointments';
  if (resourceType.includes('order')) return '/orders';
  if (resourceType.includes('payment')) return '/payments';
  return '/notifications';
}
