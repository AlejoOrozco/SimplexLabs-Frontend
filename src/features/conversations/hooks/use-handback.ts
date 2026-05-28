'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handbackConversation } from '@/features/conversations/api/conversations.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import { notify } from '@/lib/toast';

export function useHandback(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => handbackConversation(conversationId),
    onSuccess: async () => {
      notify.success('Handed back to agent', {
        description: 'The AI agent can respond to new messages again.',
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations.detail(conversationId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all }),
      ]);
    },
    onError: (error) => {
      const description = error instanceof Error ? error.message : 'Unexpected error';
      notify.error('Could not hand back', { description });
    },
  });
}
