import { apiGet, apiPut } from '@/lib/api/client';
import { adminCompanyPath } from '@/lib/api/admin-hub/admin-hub-paths';
import type { AdminAgentConfig, AdminUpdateAgentConfigDto } from '@/lib/types/admin-hub';

export async function getAdminCompanyAgentConfig(companyId: string): Promise<AdminAgentConfig> {
  return apiGet<AdminAgentConfig>(`${adminCompanyPath(companyId)}/agent-config`);
}

export async function updateAdminCompanyAgentConfig(
  companyId: string,
  dto: AdminUpdateAgentConfigDto,
): Promise<AdminAgentConfig> {
  return apiPut<AdminAgentConfig, AdminUpdateAgentConfigDto>(
    `${adminCompanyPath(companyId)}/agent-config`,
    dto,
  );
}
