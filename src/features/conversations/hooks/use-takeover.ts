'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { createIdempotencyKey } from '@/lib/api/idempotency';
import { notify } from '@/lib/toast';

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
      notify.success('Conversation taken over', {
        description: 'You can now reply as a human operator',
      });
      await queryClient.invalidateQueries({ queryKey: ['conversations', 'detail', conversationId] });
    },
    onError: (error) => {
      const description = error instanceof Error ? error.message : 'Unexpected error';
      notify.error('Failed to take over conversation', { description });
    },
  });
}
