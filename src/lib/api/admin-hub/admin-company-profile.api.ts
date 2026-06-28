import { apiPut } from '@/lib/api/client';
import { adminCompanyPath } from '@/lib/api/admin-hub/admin-hub-paths';
import type { AdminUpdateCompanyProfileDto } from '@/lib/types/admin-hub';
import type { Company } from '@/lib/types';

export async function updateAdminCompanyProfile(
  companyId: string,
  dto: AdminUpdateCompanyProfileDto,
): Promise<Company> {
  return apiPut<Company, AdminUpdateCompanyProfileDto>(adminCompanyPath(companyId), dto);
}
