import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/admin-user-creation.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { AdminCreateUserResult, AdminCreateUserVariables } from '@/lib/types/admin-provisioning';

export function useAdminCreateUser() {
  const qc = useQueryClient();
  return useMutation<AdminCreateUserResult, Error, AdminCreateUserVariables>({
    mutationFn: (variables) =>
      variables.flow === 'client'
        ? api.adminCreateClientUser(variables.dto)
        : api.adminCreateStaffUser(variables.dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users.list() });
    },
  });
}
