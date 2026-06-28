import { apiGet } from '@/lib/api/client';
import { adminCompanyPath } from '@/lib/api/admin-hub/admin-hub-paths';
import type { AdminManageSummary } from '@/lib/types/admin-hub';

export async function getAdminManageSummary(companyId: string): Promise<AdminManageSummary> {
  return apiGet<AdminManageSummary>(`${adminCompanyPath(companyId)}/manage-summary`);
}
