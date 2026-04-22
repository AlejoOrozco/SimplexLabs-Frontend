'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getConversations } from '@/features/conversations/api/conversations.api';

export function useConversationList() {
  return useInfiniteQuery({
    queryKey: ['conversations', 'list'],
    queryFn: () => getConversations(),
    initialPageParam: 0,
    getNextPageParam: () => undefined,
  });
}
