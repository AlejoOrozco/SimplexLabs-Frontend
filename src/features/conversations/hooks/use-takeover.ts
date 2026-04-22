'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { createIdempotencyKey } from '@/lib/api/idempotency';

export function useTakeover(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) =>
      apiFetch(endpoints.conversations.takeover.path.replace(':id', conversationId), {
        method: 'POST',
        body: reason ? { reason } : undefined,
        headers: { 'x-idempotency-key': createIdempotencyKey() },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['conversations', 'detail', conversationId] });
    },
  });
}
