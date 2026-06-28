import { apiGet, apiPut } from '@/lib/api/client';
import type { UserPermissionsManagementMap } from '@/lib/types';

export const permissionsApi = {
  async getUserPermissions(userId: string): Promise<UserPermissionsManagementMap> {
    return apiGet<UserPermissionsManagementMap>(`/permissions/users/${userId}`);
  },

  async updateUserPermissions(
    userId: string,
    updates: Array<{ permissionKey: string; isGranted: boolean }>,
  ): Promise<void> {
    await apiPut<void, { updates: typeof updates }>(`/permissions/users/${userId}`, { updates });
  },
};
