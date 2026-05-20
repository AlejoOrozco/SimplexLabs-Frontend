import { useQuery } from '@tanstack/react-query';
import type { EventInput } from '@fullcalendar/core';
import { getCalendarEvents, type CalendarEventsQuery } from '@/lib/api/calendar.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { CalendarEventRecord } from '@/lib/types/calendar';

function toEventInput(record: CalendarEventRecord): EventInput {
  return {
    id: record.id,
    title: record.title,
    start: record.start,
    end: record.end,
    extendedProps: {
      type: record.type,
      status: record.status,
      callMeAsap: record.callMeAsap,
      isRecurring: record.isRecurring,
      organizer: record.organizer,
    },
  };
}

export function useCalendarEvents(params: CalendarEventsQuery) {
  const key = {
    start: params.start,
    end: params.end,
    staffMemberId: params.staffMemberId ?? '',
    scope: params.scope ?? '',
  };

  return useQuery({
    queryKey: queryKeys.calendar.events(key),
    queryFn: async () => {
      const rows = await getCalendarEvents(params);
      return rows.map(toEventInput);
    },
    enabled: Boolean(params.start && params.end),
    staleTime: 30_000,
  });
}
