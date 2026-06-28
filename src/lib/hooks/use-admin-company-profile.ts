import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminCompanyProfile } from '@/lib/api/admin-hub';
import { invalidateAdminCompanyManageHub } from '@/lib/admin/admin-hub-query-invalidation';
import type { AdminUpdateCompanyProfileDto } from '@/lib/types/admin-hub';
import type { Company } from '@/lib/types';

export function useAdminUpdateCompanyProfile(companyId: string) {
  const qc = useQueryClient();
  return useMutation<Company, Error, AdminUpdateCompanyProfileDto>({
    mutationFn: (dto) => updateAdminCompanyProfile(companyId, dto),
    onSuccess: () => {
      invalidateAdminCompanyManageHub(qc, companyId);
    },
  });
}
