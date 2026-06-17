import type { Notification } from '@/lib/api/endpoints';
import { APPOINTMENT_CALLBACK_NOTIFICATION_RESOURCE } from '@/lib/appointments/callback-utils';
import { adminCompanyWorkspaceHref } from '@/lib/admin/admin-company-workspace-href';
import { isPlatformOperatorRole } from '@/lib/auth/session-role-utils';
import type { SessionRoleName } from '@/lib/types';

function readPayloadAppointmentId(notification: Notification): string | null {
  const appointmentId = notification.payload?.appointmentId;
  return typeof appointmentId === 'string' && appointmentId.length > 0 ? appointmentId : null;
}

function readPayloadRecipientUserId(notification: Notification): string | null {
  const recipientUserId = notification.payload?.recipientUserId;
  return typeof recipientUserId === 'string' && recipientUserId.length > 0 ? recipientUserId : null;
}

export function isNotificationForUser(notification: Notification, currentUserId: string | null | undefined): boolean {
  const recipientUserId = readPayloadRecipientUserId(notification);
  if (!recipientUserId) return true;
  if (!currentUserId) return false;
  return recipientUserId === currentUserId;
}

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
  if (resourceType.includes('appointment')) {
    const appointmentId = readPayloadAppointmentId(notification) ?? resourceId;
    return `/appointments?highlight=${encodeURIComponent(appointmentId)}`;
  }
  if (resourceType.includes('order')) return '/orders';
  if (resourceType.includes('payment')) return '/payments';
  return '/notifications';
}
