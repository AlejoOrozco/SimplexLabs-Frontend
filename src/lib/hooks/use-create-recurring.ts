import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeCalendarAppointmentRecurring } from '@/lib/api/calendar.api';
import { ApiClientError } from '@/lib/api/client';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { MakeRecurringDto } from '@/lib/types/calendar';
import { notify } from '@/lib/toast';

export function useCreateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: MakeRecurringDto }) =>
      makeCalendarAppointmentRecurring(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      notify.success('Recurrence saved', {
        description: 'Future occurrences will appear on the calendar after sync.',
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiClientError ? error.message : 'Could not save recurrence';
      notify.error('Recurrence failed', { description: message });
    },
  });
}
