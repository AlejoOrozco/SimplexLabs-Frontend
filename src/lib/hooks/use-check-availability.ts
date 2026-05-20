import { useQuery } from '@tanstack/react-query';
import {
  checkCalendarAvailability,
  type CheckAvailabilityBody,
} from '@/lib/api/calendar.api';

export function useCheckAvailability(body: CheckAvailabilityBody | null) {
  return useQuery({
    queryKey: ['calendar', 'availability', body] as const,
    queryFn: () => checkCalendarAvailability(body as CheckAvailabilityBody),
    enabled: body !== null,
    staleTime: 0,
  });
}
