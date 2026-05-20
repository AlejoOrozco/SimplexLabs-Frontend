'use client';

interface EventCardProps {
  title: string;
  callMeAsap: boolean;
  isRecurring: boolean;
}

export function EventCard({ title, callMeAsap, isRecurring }: EventCardProps): JSX.Element {
  return (
    <div className="calendar-event-content flex items-start justify-between gap-1 overflow-hidden">
      <span className="event-title truncate">{title}</span>
      <span className="event-badges flex shrink-0 items-center gap-0.5">
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
