import type { Notification } from '@/lib/api/endpoints';
import type { Appointment } from '@/lib/types';
import { AppointmentConfirmationStatus, AppointmentType } from '@/lib/types';

/** Backend convention: callback alerts for admins use this `resourceType` with `resourceId` = companyId. */
export const APPOINTMENT_CALLBACK_NOTIFICATION_RESOURCE = 'appointment_callback' as const;

export function appointmentNeedsCallback(appointment: Appointment): boolean {
  return Boolean(appointment.callMeAsap) && !appointment.callbackHandledAt;
}

export function isAppointmentCallbackNotification(notification: Notification): boolean {
  return notification.resourceType?.toLowerCase() === APPOINTMENT_CALLBACK_NOTIFICATION_RESOURCE;
}

export function getEffectiveAppointmentConfirmationStatus(
  appointment: Appointment,
): AppointmentConfirmationStatus {
  if (appointment.type !== AppointmentType.SIMPLEX_WITH_CLIENT) {
    return AppointmentConfirmationStatus.CONFIRMED;
  }
  return appointment.confirmationStatus ?? AppointmentConfirmationStatus.PENDING;
}
