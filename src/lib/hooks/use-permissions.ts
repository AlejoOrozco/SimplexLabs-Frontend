import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionsApi } from '@/lib/api/permissions.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import { notify } from '@/lib/toast';

export function useUserPermissionsForManagement(userId: string) {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: () => permissionsApi.getUserPermissions(userId),
    enabled: Boolean(userId),
  });
}

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Array<{ permissionKey: string; isGranted: boolean }>;
    }) => permissionsApi.updateUserPermissions(userId, updates),
    onSuccess: (_data, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] });
    },
    onError: () => {
      notify.error('Failed to update permissions');
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      permissionsApi.updateUserRole(userId, roleName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'An error occurred';
      notify.error('Cannot change role', { description: message });
    },
  });
}
