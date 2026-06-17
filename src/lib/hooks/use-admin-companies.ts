import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/admin-companies.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type {
  AdminCompanyDetail,
  AdminCompanyListItem,
  AdminCompanyReactivateResponse,
} from '@/lib/types/admin-companies';

export function useAdminCompanies() {
  return useQuery<AdminCompanyListItem[]>({
    queryKey: queryKeys.admin.companies.list(),
    queryFn: api.getAdminCompanies,
  });
}

export function useAdminCompanyDetail(companyId: string | undefined) {
  return useQuery<AdminCompanyDetail>({
    queryKey: queryKeys.admin.companies.detail(companyId ?? ''),
    queryFn: () => api.getAdminCompanyDetail(companyId as string),
    enabled: Boolean(companyId),
  });
}

export function useReactivateAdminCompany() {
  const qc = useQueryClient();
  return useMutation<AdminCompanyReactivateResponse, Error, string>({
    mutationFn: api.reactivateAdminCompany,
    onSuccess: (_data, companyId) => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.companies.all });
      void qc.invalidateQueries({ queryKey: queryKeys.admin.companies.detail(companyId) });
      void qc.invalidateQueries({ queryKey: queryKeys.users.all });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}
