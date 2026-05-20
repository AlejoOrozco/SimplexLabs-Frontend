'use client';

import { CheckCircle2, CircleAlert, Info, Phone, XCircle } from 'lucide-react';
import type { Notification } from '@/lib/api/endpoints';
import { isAppointmentCallbackNotification } from '@/lib/appointments/callback-utils';

export function SidebarNotificationRowIcon({ notification }: { notification: Notification }): JSX.Element {
  if (isAppointmentCallbackNotification(notification)) {
    return <Phone className="h-4 w-4 text-warning" />;
  }
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
}
