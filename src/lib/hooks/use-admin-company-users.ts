import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateClientUser,
  adminCreateStaffUser,
} from '@/lib/api/admin-user-creation.api';
import {
  deactivateAdminUser,
  getAdminCompanyUsers,
  reactivateAdminUser,
  updateAdminUserRole,
} from '@/lib/api/admin-hub';
import { invalidateAdminCompanyManageHub } from '@/lib/admin/admin-hub-query-invalidation';
import { queryKeys } from '@/lib/hooks/query-keys';
import type {
  AdminCreateUserResult,
  AdminCreateUserVariables,
} from '@/lib/types/admin-provisioning';
import type { AdminCompanyHubUser } from '@/lib/types/admin-hub';
import type { SessionRoleName } from '@/lib/types';

const COMPANY_USERS_STALE_MS = 1000 * 60 * 2;

export function useAdminCompanyUsers(companyId: string | undefined) {
  return useQuery<AdminCompanyHubUser[]>({
    queryKey: queryKeys.admin.manage.users(companyId ?? ''),
    queryFn: () => getAdminCompanyUsers(companyId as string),
    enabled: Boolean(companyId),
    staleTime: COMPANY_USERS_STALE_MS,
  });
}

function useInvalidateCompanyUsers(companyId: string) {
  const qc = useQueryClient();
  return (): void => {
    invalidateAdminCompanyManageHub(qc, companyId);
  };
}

export function useAdminCreateCompanyUser(companyId: string) {
  const invalidate = useInvalidateCompanyUsers(companyId);
  return useMutation<AdminCreateUserResult, Error, AdminCreateUserVariables>({
    mutationFn: (variables) =>
      variables.flow === 'client'
        ? adminCreateClientUser(variables.dto)
        : adminCreateStaffUser(variables.dto),
    onSuccess: invalidate,
  });
}

export function useAdminDeactivateUser(companyId: string) {
  const invalidate = useInvalidateCompanyUsers(companyId);
  return useMutation<void, Error, string>({
    mutationFn: deactivateAdminUser,
    onSuccess: invalidate,
  });
}

export function useAdminReactivateUser(companyId: string) {
  const invalidate = useInvalidateCompanyUsers(companyId);
  return useMutation<void, Error, string>({
    mutationFn: reactivateAdminUser,
    onSuccess: invalidate,
  });
}

export function useAdminUpdateUserRole(companyId: string) {
  const invalidate = useInvalidateCompanyUsers(companyId);
  return useMutation<void, Error, { userId: string; newRoleName: SessionRoleName }>({
    mutationFn: ({ userId, newRoleName }) => updateAdminUserRole(userId, newRoleName),
    onSuccess: invalidate,
  });
}
