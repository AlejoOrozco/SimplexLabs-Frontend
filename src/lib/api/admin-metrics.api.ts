import { apiGet, ApiClientError } from '@/lib/api/client';

/**
 * Optional aggregate for the admin dashboard. Returns null when the route is not implemented (404).
 */
export async function getAgentFailureCount(): Promise<number | null> {
  try {
    const body = await apiGet<{ count: number }>('/admin/metrics/agent-failures');
    return typeof body.count === 'number' && Number.isFinite(body.count) ? body.count : null;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
