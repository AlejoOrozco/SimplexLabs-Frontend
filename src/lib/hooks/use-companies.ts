import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/companies.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { CreateCompanyDto, UpdateCompanyDto } from '@/lib/schemas/company.schema';
import type { Company } from '@/lib/types';

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: queryKeys.companies.list(),
    queryFn: api.getCompanies,
  });
}

export function useCompany(id: string | undefined) {
  return useQuery<Company>({
    queryKey: queryKeys.companies.detail(id ?? ''),
    queryFn: () => api.getCompany(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation<Company, Error, CreateCompanyDto>({
    mutationFn: api.createCompany,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.list() });
    },
  });
}

export function useUpdateCompany(id: string) {
  const qc = useQueryClient();
  return useMutation<Company, Error, UpdateCompanyDto>({
    mutationFn: (dto) => api.updateCompany(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.detail(id) });
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: api.deleteCompany,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.list() });
    },
  });
}
