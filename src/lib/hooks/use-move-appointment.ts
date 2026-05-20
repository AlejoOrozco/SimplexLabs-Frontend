import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moveCalendarAppointment } from '@/lib/api/calendar.api';
import { ApiClientError } from '@/lib/api/client';
import { queryKeys } from '@/lib/hooks/query-keys';
import { notify } from '@/lib/toast';

export function useMoveAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      newStart,
      newEnd,
    }: {
      id: string;
      newStart: string;
      newEnd: string;
    }) => moveCalendarAppointment(id, { newStart, newEnd }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      notify.success('Appointment rescheduled', {
        description: 'The other party has been notified and may need to re-confirm.',
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'The selected time slot is not available';
      notify.error('Cannot move appointment', { description: message });
    },
  });
}
