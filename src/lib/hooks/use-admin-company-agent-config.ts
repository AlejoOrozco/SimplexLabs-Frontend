import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminCompanyAgentConfig, updateAdminCompanyAgentConfig } from '@/lib/api/admin-hub';
import { isApiNotFoundError } from '@/lib/api/get-api-error-message';
import { invalidateAdminCompanyManageHub } from '@/lib/admin/admin-hub-query-invalidation';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { AdminAgentConfig, AdminUpdateAgentConfigDto } from '@/lib/types/admin-hub';

const AGENT_CONFIG_STALE_MS = 1000 * 60 * 2;

export function useAdminCompanyAgentConfig(companyId: string | undefined) {
  return useQuery<AdminAgentConfig | null>({
    queryKey: queryKeys.admin.manage.agentConfig(companyId ?? ''),
    queryFn: async () => {
      try {
        return await getAdminCompanyAgentConfig(companyId as string);
      } catch (error) {
        if (isApiNotFoundError(error)) return null;
        throw error;
      }
    },
    enabled: Boolean(companyId),
    staleTime: AGENT_CONFIG_STALE_MS,
  });
}

export function useAdminUpdateCompanyAgentConfig(companyId: string) {
  const qc = useQueryClient();
  return useMutation<AdminAgentConfig, Error, AdminUpdateAgentConfigDto>({
    mutationFn: (dto) => updateAdminCompanyAgentConfig(companyId, dto),
    onSuccess: () => {
      invalidateAdminCompanyManageHub(qc, companyId);
    },
  });
}
