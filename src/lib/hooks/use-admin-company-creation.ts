import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/admin-company-creation.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { AdminCreateCompanyDto, AdminCreateCompanyResult } from '@/lib/types/admin-provisioning';

export function useAdminCreateCompanyWithSetup() {
  const qc = useQueryClient();
  return useMutation<AdminCreateCompanyResult, Error, AdminCreateCompanyDto>({
    mutationFn: api.adminCreateCompanyWithSetup,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.list() });
    },
  });
}
