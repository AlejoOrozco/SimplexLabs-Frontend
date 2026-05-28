'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendConversationMessage } from '@/features/conversations/api/conversations.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import { notify } from '@/lib/toast';

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendConversationMessage(conversationId, content),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations.messages(conversationId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all }),
      ]);
    },
    onError: (error) => {
      const description = error instanceof Error ? error.message : 'Failed to send message';
      notify.error(description);
    },
  });
}
