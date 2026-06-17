'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { appointmentHasPendingInvitation, appointmentInvitationWasAccepted } from '@/lib/appointments/invitation-utils';
import { useRespondToAppointment } from '@/lib/hooks/use-appointments';
import type { Appointment } from '@/lib/types';
import { AppointmentInvitationStatus } from '@/lib/types';
import { notify } from '@/lib/toast';

interface AppointmentInvitationActionsProps {
  appointment: Appointment;
  onResponded?: () => void;
}

export function AppointmentInvitationActions({
  appointment,
  onResponded,
}: AppointmentInvitationActionsProps): JSX.Element | null {
  const { can } = useAuth();
  const respond = useRespondToAppointment();

  if (appointment.viewerRole !== 'invitee') return null;

  if (appointmentInvitationWasAccepted(appointment)) {
    return (
      <div className="flex items-center gap-2 text-success">
        <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
        <span className="text-sm font-medium">Invitation accepted — confirmed on your calendar</span>
      </div>
    );
  }

  if (appointment.invitationStatus === AppointmentInvitationStatus.DECLINED) {
    return (
      <p className="text-sm text-text-secondary">You declined this invitation.</p>
    );
  }

  if (!appointmentHasPendingInvitation(appointment)) return null;

  const canRespond = can('company.appointments.attendees');

  const handleRespond = (status: 'ACCEPTED' | 'DECLINED'): void => {
    respond.mutate(
      { id: appointment.id, status },
      {
        onSuccess: () => {
          notify.success(status === 'ACCEPTED' ? 'Invitation accepted' : 'Invitation declined');
          onResponded?.();
        },
        onError: (err) =>
          notify.error(err instanceof Error ? err.message : 'Could not update invitation'),
      },
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-warning-dark">You have a pending invitation to this appointment.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          disabled={!canRespond || respond.isPending}
          onClick={() => handleRespond('ACCEPTED')}
        >
          {respond.isPending ? 'Saving…' : 'Accept'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!canRespond || respond.isPending}
          onClick={() => handleRespond('DECLINED')}
        >
          <XCircle className="h-4 w-4" aria-hidden />
          Decline
        </Button>
      </div>
      {!canRespond ? (
        <p className="text-xs text-text-secondary">You do not have permission to respond to invitations.</p>
      ) : null}
    </div>
  );
}
