import { useQuery } from '@tanstack/react-query';
import { getAdminFailedAgentRuns } from '@/lib/api/admin-failed-tasks.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { AgentRun } from '@/lib/types/agent-pipeline-failure';

export function useAdminFailedAgentRuns() {
  return useQuery<AgentRun[]>({
    queryKey: queryKeys.admin.failedTasks(),
    queryFn: getAdminFailedAgentRuns,
    staleTime: 30_000,
  });
}
