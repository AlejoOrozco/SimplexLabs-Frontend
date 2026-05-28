'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  getConversation,
  getConversationMessages,
} from '@/features/conversations/api/conversations.api';
import { clearUnreadForConversation } from '@/features/conversations/realtime/conversation-cache-updates';
import { queryKeys } from '@/lib/hooks/query-keys';

export function useConversationThread(conversationId: string) {
  const queryClient = useQueryClient();

  const conversationQuery = useQuery({
    queryKey: queryKeys.conversations.detail(conversationId),
    queryFn: () => getConversation(conversationId),
    enabled: Boolean(conversationId),
  });

  const messagesQuery = useQuery({
    queryKey: queryKeys.conversations.messages(conversationId),
    queryFn: () => getConversationMessages(conversationId),
    enabled: Boolean(conversationId),
  });

  useEffect(() => {
    if (!conversationId) return;
    clearUnreadForConversation(queryClient, conversationId);
  }, [conversationId, queryClient]);

  return { conversationQuery, messagesQuery };
}
