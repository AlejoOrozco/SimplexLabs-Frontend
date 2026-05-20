import { apiGet } from '@/lib/api/client';
import type { AgentRun } from '@/lib/types/agent-pipeline-failure';

export async function getAdminFailedAgentRuns(): Promise<AgentRun[]> {
  return apiGet<AgentRun[]>('/admin/failed-tasks');
}
