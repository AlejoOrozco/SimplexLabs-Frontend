'use client';

import { useCallback, useRef, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface CalendarViewProps {
  companyId?: string;
}

function readOrganizerId(raw: unknown): string | undefined {
  if (raw && typeof raw === 'object' && 'id' in raw && typeof (raw as { id: unknown }).id === 'string') {
    return (raw as { id: string }).id;
  }
  return undefined;
}

export function CalendarView({ companyId }: CalendarViewProps): JSX.Element {
  const { user, isSimplexAdmin, isSimplexStaff } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);
  const userTimezone = getUserTimezone(user?.timezone);
  const isAdmin = isSimplexAdmin || isSimplexStaff;

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [scope, setScope] = useState<CalendarScope>('mine');
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

  const eventClassNames = useCallback((arg: EventContentArg) => {
    const classes: string[] = ['calendar-event'];
    const type = arg.event.extendedProps['type'] as string | undefined;
    const status = arg.event.extendedProps['status'] as string | undefined;
    const callMeAsap = Boolean(arg.event.extendedProps['callMeAsap']);

    if (type === 'SIMPLEX_WITH_CLIENT') classes.push('event-brand');
    else if (type === 'CLIENT_WITH_CONTACT') classes.push('event-info');
    else classes.push('event-neutral');

    if (status === 'PENDING') classes.push('event-pending');
    if (status === 'CANCELLED') classes.push('event-cancelled');
    if (callMeAsap) classes.push('event-callback-requested');

    return classes;
  }, []);

  const renderEventContent = useCallback((arg: EventContentArg) => {
    const callMeAsap = Boolean(arg.event.extendedProps['callMeAsap']);
    const isRecurring = Boolean(arg.event.extendedProps['isRecurring']);
    return <EventCard title={arg.event.title} callMeAsap={callMeAsap} isRecurring={isRecurring} />;
  }, []);

  const detailAppointment: Appointment | null = detailQuery.data ?? null;
  const canRecur =
    detailAppointment !== null &&
    detailAppointment.organizerId === user?.id;

  return (
    <div className="calendar-wrapper min-h-0 flex-1">
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
        <div className="mb-3 rounded-lg border border-error bg-error-light p-3 text-sm text-error-dark">
          Could not load calendar events. Ensure the calendar API is available.
        </div>
      ) : null}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="timeGridWeek"
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
