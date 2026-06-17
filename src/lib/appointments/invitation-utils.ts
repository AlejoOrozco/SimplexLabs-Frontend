import type { Appointment } from '@/lib/types';
import {
  AppointmentInvitationStatus,
  AppointmentViewerRole,
} from '@/lib/types';

export interface CalendarInvitationProps {
  viewerRole?: string;
  invitationPending?: boolean;
  invitationStatus?: string;
}

export function isPendingInvitation(props: CalendarInvitationProps): boolean {
  return (
    props.viewerRole === AppointmentViewerRole.INVITEE &&
    Boolean(props.invitationPending)
  );
}

export function isAcceptedInvitation(props: CalendarInvitationProps): boolean {
  return (
    props.viewerRole === AppointmentViewerRole.INVITEE &&
    props.invitationStatus === AppointmentInvitationStatus.ACCEPTED
  );
}

export function appointmentHasPendingInvitation(appointment: Appointment): boolean {
  return (
    appointment.viewerRole === AppointmentViewerRole.INVITEE &&
    Boolean(appointment.invitationPending)
  );
}

export function appointmentInvitationWasAccepted(appointment: Appointment): boolean {
  return (
    appointment.viewerRole === AppointmentViewerRole.INVITEE &&
    appointment.invitationStatus === AppointmentInvitationStatus.ACCEPTED
  );
}
