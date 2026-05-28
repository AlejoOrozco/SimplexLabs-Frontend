'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  listConversations,
  type ListConversationsParams,
} from '@/features/conversations/api/conversations.api';
import { queryKeys } from '@/lib/hooks/query-keys';

export function useConversationList(params?: ListConversationsParams) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.conversations.list(params?.channel), params?.status ?? 'all'],
    queryFn: () => listConversations(params),
    initialPageParam: 0,
    getNextPageParam: () => undefined,
  });
}
