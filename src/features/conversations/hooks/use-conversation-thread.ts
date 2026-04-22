'use client';

import { useQuery } from '@tanstack/react-query';
import { getConversation, getConversationMessages } from '@/features/conversations/api/conversations.api';

export function useConversationThread(conversationId: string) {
  const conversationQuery = useQuery({
    queryKey: ['conversations', 'detail', conversationId],
    queryFn: () => getConversation(conversationId),
  });

  const messagesQuery = useQuery({
    queryKey: ['conversations', 'messages', conversationId],
    queryFn: () => getConversationMessages(conversationId),
  });

  return { conversationQuery, messagesQuery };
}
