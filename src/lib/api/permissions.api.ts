import { apiGet, apiPatch, apiPut } from '@/lib/api/client';
import type { UserPermissionsManagementMap } from '@/lib/types';

export const permissionsApi = {
  async getUserPermissions(userId: string): Promise<UserPermissionsManagementMap> {
    return apiGet<UserPermissionsManagementMap>(`/users/${userId}/permissions`);
  },

  async updateUserPermissions(
    userId: string,
    updates: Array<{ permissionKey: string; isGranted: boolean }>,
  ): Promise<void> {
    await apiPatch<void, { updates: typeof updates }>(`/users/${userId}/permissions`, { updates });
  },

  async updateUserRole(userId: string, roleName: string): Promise<void> {
    await apiPut<void, { roleName: string }>(`/users/${userId}/role`, { roleName });
  },

  async getAdminPermissionWizardTemplate(
    role: 'COMPANY_STAFF' | 'COMPANY_ADMIN',
  ): Promise<UserPermissionsManagementMap> {
    return apiGet<UserPermissionsManagementMap>('/admin/permissions/wizard-template', {
      params: { role },
    });
  },
};
