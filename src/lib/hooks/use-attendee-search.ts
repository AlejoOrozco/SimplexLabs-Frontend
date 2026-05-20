import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/lib/api/search.api';

export function useAttendeeSearch(query: string, appointmentId?: string) {
  return useQuery({
    queryKey: ['attendee-search', query, appointmentId ?? ''],
    queryFn: () => searchApi.searchAttendees(query, appointmentId),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 10,
  });
}
