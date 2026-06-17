'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
} from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import { AppointmentDetailModal } from '@/components/appointments/AppointmentDetailModal';
import { AppointmentModal } from '@/components/calendar/appointment-modal';
import { CalendarLegend } from '@/components/calendar/calendar-legend';
import { CalendarToolbar } from '@/components/calendar/calendar-toolbar';
import { EventCard } from '@/components/calendar/event-card';
import { MoveConfirmModal } from '@/components/calendar/move-confirm-modal';
import { RecurringSetupModal } from '@/components/calendar/recurring-setup-modal';
import { useAuth } from '@/context/auth-context';
import { useCalendarEvents } from '@/lib/hooks/use-calendar-events';
import { useCalendarStaff } from '@/lib/hooks/use-calendar-staff';
import { getAppointment } from '@/lib/api/appointments.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { CalendarScope, PendingMove } from '@/lib/types/calendar';
import type { Appointment } from '@/lib/types';
import { getUserTimezone } from '@/lib/utils/timezone';
import { notify } from '@/lib/toast';
import { isAcceptedInvitation, isPendingInvitation } from '@/lib/appointments/invitation-utils';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface CalendarViewProps {
  companyId?: string;
  /** Opens the detail modal and highlights this event on the grid (e.g. from notification deep link). */
  highlightAppointmentId?: string | null;
}

function readInvitationProps(extendedProps: Record<string, unknown>): {
  viewerRole?: string;
  invitationPending?: boolean;
  invitationStatus?: string;
} {
  return {
    viewerRole: typeof extendedProps.viewerRole === 'string' ? extendedProps.viewerRole : undefined,
    invitationPending:
      typeof extendedProps.invitationPending === 'boolean' ? extendedProps.invitationPending : undefined,
    invitationStatus:
      typeof extendedProps.invitationStatus === 'string' ? extendedProps.invitationStatus : undefined,
  };
}

function readOrganizerId(raw: unknown): string | undefined {
  if (raw && typeof raw === 'object' && 'id' in raw && typeof (raw as { id: unknown }).id === 'string') {
    return (raw as { id: string }).id;
  }
  return undefined;
}

export function CalendarView({ companyId, highlightAppointmentId }: CalendarViewProps): JSX.Element {
  const { user, isSimplexAdmin, isSimplexStaff } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);
  const userTimezone = getUserTimezone(user?.timezone);
  const isAdmin = isSimplexAdmin || isSimplexStaff;

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [scope, setScope] = useState<CalendarScope>(() => (isAdmin ? 'all' : 'mine'));
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>();

  const [createModal, setCreateModal] = useState<{
    open: boolean;
    initialDate?: string;
    initialTime?: string;
  }>({ open: false });

  const [detailAppointmentId, setDetailAppointmentId] = useState<string | null>(null);
  const [recurringForId, setRecurringForId] = useState<string | null>(null);
  const [recurringOpen, setRecurringOpen] = useState(false);

  const [moveModal, setMoveModal] = useState<{ open: boolean; pending?: PendingMove }>({ open: false });

  const staffEnabled = isAdmin;
  const staffQuery = useCalendarStaff(staffEnabled);
  const staff = staffQuery.data ?? [];

  const eventsQuery = useCalendarEvents({
    start: dateRange.start,
    end: dateRange.end,
    staffMemberId: selectedStaffId,
    scope: isAdmin ? scope : undefined,
  });

  const detailQuery = useQuery({
    queryKey: detailAppointmentId ? queryKeys.appointments.detail(detailAppointmentId) : ['appointments', 'idle'],
    queryFn: () => getAppointment(detailAppointmentId as string),
    enabled: detailAppointmentId !== null,
  });

  useEffect(() => {
    if (!highlightAppointmentId) return;
    setDetailAppointmentId(highlightAppointmentId);
  }, [highlightAppointmentId]);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setDateRange({
      start: arg.start.toISOString(),
      end: arg.end.toISOString(),
    });
  }, []);

  const handleDateSelect = useCallback((arg: DateSelectArg) => {
    const startStr = arg.startStr;
    const datePart = startStr.split('T')[0] ?? '';
    const afterT = startStr.split('T')[1];
    const timePart = startStr.includes('T') && afterT ? afterT.slice(0, 5) : '09:00';
    setCreateModal({
      open: true,
      initialDate: datePart,
      initialTime: timePart,
    });
    calendarRef.current?.getApi().unselect();
  }, []);

  const openMoveConfirm = useCallback(
    (arg: { event: EventDropArg['event']; revert: () => void }) => {
      const start = arg.event.startStr;
      const end = arg.event.endStr ?? start;
      setMoveModal({
        open: true,
        pending: {
          eventId: arg.event.id,
          newStart: start,
          newEnd: end,
          revert: arg.revert,
          staffMemberId: selectedStaffId,
        },
      });
    },
    [selectedStaffId],
  );

  const handleEventDrop = useCallback(
    (arg: EventDropArg) => {
      const organizerId = readOrganizerId(arg.event.extendedProps['organizer']);
      if (organizerId !== user?.id) {
        arg.revert();
        notify.warning('Only the organizer can reschedule this appointment');
        return;
      }
      openMoveConfirm({ event: arg.event, revert: arg.revert });
    },
    [user?.id, openMoveConfirm],
  );

  const handleEventResize = useCallback(
    (arg: EventResizeDoneArg) => {
      const organizerId = readOrganizerId(arg.event.extendedProps['organizer']);
      if (organizerId !== user?.id) {
        arg.revert();
        notify.warning('Only the organizer can reschedule this appointment');
        return;
      }
      openMoveConfirm({ event: arg.event, revert: arg.revert });
    },
    [user?.id, openMoveConfirm],
  );

  const handleEventClick = useCallback((arg: EventClickArg) => {
    setDetailAppointmentId(arg.event.id);
  }, []);

  const eventClassNames = useCallback(
    (arg: EventContentArg) => {
      const classes: string[] = ['calendar-event'];
      const type = arg.event.extendedProps['type'] as string | undefined;
      const status = arg.event.extendedProps['status'] as string | undefined;
      const callMeAsap = Boolean(arg.event.extendedProps['callMeAsap']);
      const invitation = readInvitationProps(arg.event.extendedProps as Record<string, unknown>);

      if (isPendingInvitation(invitation)) classes.push('event-invitation-pending');
      else if (isAcceptedInvitation(invitation)) classes.push('event-invitation-accepted');
      else if (type === 'SIMPLEX_WITH_CLIENT') classes.push('event-brand');
      else if (type === 'CLIENT_WITH_CONTACT') classes.push('event-info');
      else classes.push('event-neutral');

      if (status === 'PENDING') classes.push('event-pending');
      if (status === 'CANCELLED') classes.push('event-cancelled');
      if (callMeAsap) classes.push('event-callback-requested');
      if (highlightAppointmentId && arg.event.id === highlightAppointmentId) {
        classes.push('event-highlighted');
      }

      return classes;
    },
    [highlightAppointmentId],
  );

  const renderEventContent = useCallback((arg: EventContentArg) => {
    const callMeAsap = Boolean(arg.event.extendedProps['callMeAsap']);
    const isRecurring = Boolean(arg.event.extendedProps['isRecurring']);
    const invitation = readInvitationProps(arg.event.extendedProps as Record<string, unknown>);
    return (
      <EventCard
        title={arg.event.title}
        callMeAsap={callMeAsap}
        isRecurring={isRecurring}
        invitationPending={isPendingInvitation(invitation)}
        invitationAccepted={isAcceptedInvitation(invitation)}
      />
    );
  }, []);

  const detailAppointment: Appointment | null = detailQuery.data ?? null;
  const canRecur =
    detailAppointment !== null &&
    detailAppointment.organizerId === user?.id;

  return (
    <div className="calendar-wrapper flex min-h-0 flex-1 flex-col gap-4">
      <CalendarToolbar
        calendarRef={calendarRef}
        isAdmin={isAdmin}
        scope={scope}
        onScopeChange={setScope}
        staff={staff}
        selectedStaffId={selectedStaffId}
        onStaffChange={setSelectedStaffId}
        showStaffFilter={isAdmin}
      />

      <CalendarLegend />

      {eventsQuery.isError ? (
        <div className="rounded-lg border border-error bg-error-surface p-3 text-sm text-error-dark">
          Could not load calendar events. Ensure the calendar API is available.
        </div>
      ) : null}

      <div className="calendar-grid-card">
        <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        timeZone={userTimezone}
        slotDuration="00:30:00"
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        selectable
        selectMirror
        editable
        droppable={false}
        events={eventsQuery.data ?? []}
        datesSet={handleDatesSet}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventClassNames={eventClassNames}
        eventContent={renderEventContent}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '08:00',
          endTime: '18:00',
        }}
        height="calc(100vh - 280px)"
        eventMaxStack={3}
      />
      </div>

      <AppointmentModal
        open={createModal.open}
        initialDate={createModal.initialDate}
        initialTime={createModal.initialTime}
        companyId={companyId}
        onClose={() => setCreateModal({ open: false })}
      />

      <AppointmentDetailModal
        appointment={detailAppointment}
        isLoading={detailAppointmentId !== null && detailQuery.isLoading}
        errorText={detailAppointmentId !== null && detailQuery.isError ? 'Could not load this appointment.' : null}
        open={detailAppointmentId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailAppointmentId(null);
        }}
        footer={
          canRecur ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!detailAppointment) return;
                setRecurringForId(detailAppointment.id);
                setRecurringOpen(true);
              }}
            >
              Make recurring
            </Button>
          ) : null
        }
      />

      <RecurringSetupModal
        appointmentId={recurringForId}
        open={recurringOpen}
        onOpenChange={(open) => {
          setRecurringOpen(open);
          if (!open) setRecurringForId(null);
        }}
      />

      <MoveConfirmModal
        open={moveModal.open}
        pending={moveModal.pending}
        userTimezone={userTimezone}
        onClose={() => setMoveModal({ open: false })}
      />
    </div>
  );
}
