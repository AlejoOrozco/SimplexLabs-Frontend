import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import { adminCompanyPath, toQueryRecord } from '@/lib/api/admin-hub/admin-hub-paths';
import type {
  AgentKbEntry,
  AgentKbListFilters,
  AgentKbListResponse,
  AgentKbUpdateDto,
  AgentKbWriteDto,
} from '@/lib/types/admin-hub';

export async function getAdminCompanyKnowledgeBase(
  companyId: string,
  filters: AgentKbListFilters = {},
): Promise<AgentKbListResponse> {
  return apiGet<AgentKbListResponse>(`${adminCompanyPath(companyId)}/knowledge-base`, {
    params: toQueryRecord({
      category: filters.category,
      isActive: filters.isActive,
      search: filters.search,
      page: filters.page,
      limit: filters.limit,
    }),
  });
}

export async function createAdminCompanyKnowledgeBaseEntry(
  companyId: string,
  dto: AgentKbWriteDto,
): Promise<AgentKbEntry> {
  return apiPost<AgentKbEntry, AgentKbWriteDto>(
    `${adminCompanyPath(companyId)}/knowledge-base`,
    dto,
  );
}

export async function updateAdminCompanyKnowledgeBaseEntry(
  companyId: string,
  entryId: string,
  dto: AgentKbUpdateDto,
): Promise<AgentKbEntry> {
  return apiPut<AgentKbEntry, AgentKbUpdateDto>(
    `${adminCompanyPath(companyId)}/knowledge-base/${encodeURIComponent(entryId)}`,
    dto,
  );
}

export async function deleteAdminCompanyKnowledgeBaseEntry(
  companyId: string,
  entryId: string,
): Promise<void> {
  await apiDelete<void>(
    `${adminCompanyPath(companyId)}/knowledge-base/${encodeURIComponent(entryId)}`,
  );
}
