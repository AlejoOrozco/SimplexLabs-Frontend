import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminCompanyKnowledgeBaseEntry,
  deleteAdminCompanyKnowledgeBaseEntry,
  getAdminCompanyKnowledgeBase,
  updateAdminCompanyKnowledgeBaseEntry,
} from '@/lib/api/admin-hub';
import { invalidateAdminCompanyManageHub } from '@/lib/admin/admin-hub-query-invalidation';
import { queryKeys } from '@/lib/hooks/query-keys';
import type {
  AgentKbEntry,
  AgentKbListFilters,
  AgentKbListResponse,
  AgentKbUpdateDto,
  AgentKbWriteDto,
} from '@/lib/types/admin-hub';

const KNOWLEDGE_BASE_STALE_MS = 1000 * 60;

export function useAdminCompanyKnowledgeBase(
  companyId: string | undefined,
  filters: AgentKbListFilters,
) {
  return useQuery<AgentKbListResponse>({
    queryKey: queryKeys.admin.manage.knowledgeBase(companyId ?? '', filters),
    queryFn: () => getAdminCompanyKnowledgeBase(companyId as string, filters),
    enabled: Boolean(companyId),
    staleTime: KNOWLEDGE_BASE_STALE_MS,
  });
}

function useInvalidateKnowledgeBase(companyId: string) {
  const qc = useQueryClient();
  return (): void => {
    invalidateAdminCompanyManageHub(qc, companyId);
  };
}

export function useAdminCreateKnowledgeBaseEntry(companyId: string) {
  const invalidate = useInvalidateKnowledgeBase(companyId);
  return useMutation<AgentKbEntry, Error, AgentKbWriteDto>({
    mutationFn: (dto) => createAdminCompanyKnowledgeBaseEntry(companyId, dto),
    onSuccess: invalidate,
  });
}

export function useAdminUpdateKnowledgeBaseEntry(companyId: string) {
  const invalidate = useInvalidateKnowledgeBase(companyId);
  return useMutation<
    AgentKbEntry,
    Error,
    { entryId: string; dto: AgentKbUpdateDto }
  >({
    mutationFn: ({ entryId, dto }) =>
      updateAdminCompanyKnowledgeBaseEntry(companyId, entryId, dto),
    onSuccess: invalidate,
  });
}

export function useAdminToggleKnowledgeBaseEntry(companyId: string) {
  const invalidate = useInvalidateKnowledgeBase(companyId);
  return useMutation<AgentKbEntry | void, Error, { entryId: string; isActive: boolean }>({
    mutationFn: async ({ entryId, isActive }) => {
      if (isActive) {
        return updateAdminCompanyKnowledgeBaseEntry(companyId, entryId, { isActive: true });
      }
      await deleteAdminCompanyKnowledgeBaseEntry(companyId, entryId);
    },
    onSuccess: invalidate,
  });
}
