import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/users.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { User } from '@/lib/types';

export function useUsers() {
  return useQuery<User[]>({
    queryKey: queryKeys.users.list(),
    queryFn: api.getUsers,
  });
}

export function useUsersByCompany(companyId: string | undefined) {
  return useQuery<User[]>({
    queryKey: queryKeys.users.listByCompany(companyId ?? ''),
    queryFn: () => api.getUsersForCompany(companyId as string),
    enabled: Boolean(companyId),
  });
}

export function useUser(id: string | undefined) {
  return useQuery<User>({
    queryKey: queryKeys.users.detail(id ?? ''),
    queryFn: () => api.getUser(id as string),
    enabled: Boolean(id),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users.all });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
      void qc.invalidateQueries({ queryKey: queryKeys.admin.companies.all });
    },
  });
}
