import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/users.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { CreateUserDto, UpdateUserDto } from '@/lib/schemas/user.schema';
import type { User } from '@/lib/types';

export function useUsers() {
  return useQuery<User[]>({
    queryKey: queryKeys.users.list(),
    queryFn: api.getUsers,
  });
}

export function useUser(id: string | undefined) {
  return useQuery<User>({
    queryKey: queryKeys.users.detail(id ?? ''),
    queryFn: () => api.getUser(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation<User, Error, CreateUserDto>({
    mutationFn: api.createUser,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users.list() });
    },
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation<User, Error, UpdateUserDto>({
    mutationFn: (dto) => api.updateUser(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users.list() });
    },
  });
}
