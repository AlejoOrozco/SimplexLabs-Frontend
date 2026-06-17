'use client';

interface EventCardProps {
  title: string;
  callMeAsap: boolean;
  isRecurring: boolean;
  invitationPending?: boolean;
  invitationAccepted?: boolean;
}

export function EventCard({
  title,
  callMeAsap,
  isRecurring,
  invitationPending = false,
  invitationAccepted = false,
}: EventCardProps): JSX.Element {
  return (
    <div className="calendar-event-content flex items-start justify-between gap-1 overflow-hidden">
      <span className="event-title truncate">
        {invitationPending ? (
          <span className="event-invitation-label" title="Pending invitation">
            Pending ·{' '}
          </span>
        ) : null}
        {title}
      </span>
      <span className="event-badges flex shrink-0 items-center gap-0.5">
        {invitationAccepted ? (
          <span className="event-badge-invitation-accepted" title="Invitation accepted" aria-hidden />
        ) : null}
        {callMeAsap ? (
          <span className="event-badge-callback" title="Callback requested" aria-hidden />
        ) : null}
        {isRecurring ? (
          <span className="event-badge-recurring" title="Recurring" aria-hidden />
        ) : null}
      </span>
    </div>
  );
}
