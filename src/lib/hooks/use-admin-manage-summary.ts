import { useQuery } from '@tanstack/react-query';
import { getAdminManageSummary } from '@/lib/api/admin-hub';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { AdminManageSummary } from '@/lib/types/admin-hub';

const MANAGE_SUMMARY_STALE_MS = 1000 * 60 * 2;

export function useAdminManageSummary(companyId: string | undefined) {
  return useQuery<AdminManageSummary>({
    queryKey: queryKeys.admin.manage.summary(companyId ?? ''),
    queryFn: () => getAdminManageSummary(companyId as string),
    enabled: Boolean(companyId),
    staleTime: MANAGE_SUMMARY_STALE_MS,
  });
}
