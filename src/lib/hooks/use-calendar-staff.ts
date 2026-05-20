import { useQuery } from '@tanstack/react-query';
import { getCalendarStaff } from '@/lib/api/calendar.api';
import { queryKeys } from '@/lib/hooks/query-keys';

/** Calendar staff for the current JWT context (tenant or platform). */
export function useCalendarStaff(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.calendar.staff(),
    queryFn: () => getCalendarStaff(),
    enabled,
    staleTime: 5 * 60_000,
  });
}
