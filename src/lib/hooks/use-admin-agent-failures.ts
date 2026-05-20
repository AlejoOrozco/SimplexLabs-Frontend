import { useQuery } from '@tanstack/react-query';
import { getAgentFailureCount } from '@/lib/api/admin-metrics.api';
import { queryKeys } from '@/lib/hooks/query-keys';

export function useAdminAgentFailureCount() {
  return useQuery<number | null>({
    queryKey: queryKeys.admin.agentFailures(),
    queryFn: getAgentFailureCount,
    staleTime: 60_000,
    retry: false,
  });
}
