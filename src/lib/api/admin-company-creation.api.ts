import { apiPost } from '@/lib/api/client';
import type { AdminCreateCompanyDto, AdminCreateCompanyResult } from '@/lib/types/admin-provisioning';

export async function adminCreateCompanyWithSetup(dto: AdminCreateCompanyDto): Promise<AdminCreateCompanyResult> {
  return apiPost<AdminCreateCompanyResult, AdminCreateCompanyDto>('/admin/companies/create-full', dto);
}
