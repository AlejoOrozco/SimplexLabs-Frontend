'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import * as authApi from '@/lib/api/auth.api';

export function useMarkFirstLoginComplete() {
  const { setUser, bumpSessionHydrationGeneration } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.markFirstLoginComplete,
    onSuccess: (me) => {
      bumpSessionHydrationGeneration();
      setUser(me);
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
