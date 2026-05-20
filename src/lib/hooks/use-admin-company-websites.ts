import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/admin-websites.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { CreateWebsiteDto } from '@/lib/schemas/website.schema';
import type { Website } from '@/lib/types';

export function useAdminCompanyWebsites(companyId: string | undefined) {
  return useQuery<Website[]>({
    queryKey: queryKeys.websites.adminList(companyId ?? ''),
    queryFn: () => api.getAdminCompanyWebsites(companyId as string),
    enabled: Boolean(companyId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminCreateCompanyWebsite(companyId: string) {
  const qc = useQueryClient();
  return useMutation<Website, Error, CreateWebsiteDto>({
    mutationFn: (dto) => api.adminCreateCompanyWebsite(companyId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.websites.adminList(companyId) });
      void qc.invalidateQueries({ queryKey: queryKeys.websites.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.websites.all });
    },
  });
}
