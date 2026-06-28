import { apiGet, apiPut } from '@/lib/api/client';
import { adminCompanyPath } from '@/lib/api/admin-hub/admin-hub-paths';
import type { AdminCompanyHubUser } from '@/lib/types/admin-hub';
import type { SessionRoleName } from '@/lib/types';

export async function getAdminCompanyUsers(companyId: string): Promise<AdminCompanyHubUser[]> {
  return apiGet<AdminCompanyHubUser[]>(`${adminCompanyPath(companyId)}/users`);
}

export async function deactivateAdminUser(userId: string): Promise<void> {
  await apiPut<void, Record<string, never>>(`/admin/users/${encodeURIComponent(userId)}/deactivate`, {});
}

export async function reactivateAdminUser(userId: string): Promise<void> {
  await apiPut<void, Record<string, never>>(`/admin/users/${encodeURIComponent(userId)}/reactivate`, {});
}

export async function updateAdminUserRole(
  userId: string,
  newRoleName: SessionRoleName,
): Promise<void> {
  await apiPut<void, { newRoleName: SessionRoleName }>(
    `/permissions/users/${encodeURIComponent(userId)}/role`,
    { newRoleName },
  );
}
