import { useQuery } from '@tanstack/react-query';
import { permissionsApi } from '@/lib/api/permissions.api';
import type { UserPermissionsManagementMap } from '@/lib/types';

export function useAdminPermissionWizardTemplate(role: 'COMPANY_STAFF' | 'COMPANY_ADMIN' | null) {
  return useQuery<UserPermissionsManagementMap>({
    queryKey: ['admin', 'permissions', 'wizard-template', role],
    queryFn: () => permissionsApi.getAdminPermissionWizardTemplate(role === 'COMPANY_ADMIN' ? 'COMPANY_ADMIN' : 'COMPANY_STAFF'),
    enabled: role === 'COMPANY_STAFF',
    retry: false,
  });
}
