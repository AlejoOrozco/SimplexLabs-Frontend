'use client';

import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SimplexAppointmentActions } from '@/components/appointments/simplex-appointment-actions';
import type { Appointment } from '@/lib/types';
import { AppointmentType } from '@/lib/types';
import {
  appointmentConfirmationLabel,
  appointmentStatusLabel,
  appointmentTypeLabel,
  formatDateTime,
  fullName,
} from '@/lib/utils/format';
import { getEffectiveAppointmentConfirmationStatus } from '@/lib/appointments/callback-utils';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Extra actions shown below the main body (e.g. calendar recurrence). */
  footer?: ReactNode;
  isLoading?: boolean;
  errorText?: string | null;
}

export function AppointmentDetailModal({
  appointment,
  open,
  onOpenChange,
  footer,
  isLoading = false,
  errorText = null,
}: AppointmentDetailModalProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border-default bg-surface-overlay text-text-primary">
        {isLoading ? (
          <>
            <DialogHeader>
              <DialogTitle>Appointment</DialogTitle>
              <DialogDescription className="text-text-secondary">Loading…</DialogDescription>
            </DialogHeader>
          </>
        ) : errorText ? (
          <>
            <DialogHeader>
              <DialogTitle>Appointment</DialogTitle>
              <DialogDescription className="text-error-dark">{errorText}</DialogDescription>
            </DialogHeader>
          </>
        ) : appointment ? (
          <>
            <DialogHeader>
              <DialogTitle>{appointment.title}</DialogTitle>
              <DialogDescription className="text-text-secondary">
                {appointmentTypeLabel(appointment.type)} · {appointmentStatusLabel(appointment.status)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Scheduled</p>
                <p className="mt-0.5 font-medium">{formatDateTime(appointment.scheduledAt)}</p>
                <p className="text-text-secondary">{appointment.durationMinutes} minutes</p>
              </div>
              {appointment.description ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Details</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-text-primary">{appointment.description}</p>
                </div>
              ) : null}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Attendee</p>
                <p className="mt-0.5 text-text-primary">
                  {appointment.contact
                    ? fullName(appointment.contact)
                    : appointment.externalAttendeeName ?? '—'}
                </p>
              </div>
              {appointment.type === AppointmentType.SIMPLEX_WITH_CLIENT ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Your response</p>
                  <p className="mt-0.5 text-text-primary">
                    {appointmentConfirmationLabel(getEffectiveAppointmentConfirmationStatus(appointment))}
                  </p>
                </div>
              ) : null}
              {appointment.type === AppointmentType.SIMPLEX_WITH_CLIENT ? (
                <div className="border-t border-border-default pt-4">
                  <SimplexAppointmentActions appointment={appointment} />
                </div>
              ) : null}
              {footer ? <div className="border-t border-border-default pt-4">{footer}</div> : null}
            </div>
          </>
        ) : (
          <DialogHeader>
            <DialogTitle>Appointment</DialogTitle>
            <DialogDescription>No appointment selected.</DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
}
