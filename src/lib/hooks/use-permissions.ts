import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionsApi } from '@/lib/api/permissions.api';
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
