import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api/conversations.api';
import type { ConversationDetail, ConversationListItem, Message } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { Channel } from '@/lib/types';

export function useConversations(channel?: Channel) {
  return useQuery<ConversationListItem[]>({
    queryKey: queryKeys.conversations.list(channel),
    queryFn: () => api.getConversations(channel),
  });
}

export function useConversation(id: string | undefined) {
  return useQuery<ConversationDetail>({
    queryKey: queryKeys.conversations.detail(id ?? ''),
    queryFn: () => api.getConversation(id as string),
    enabled: Boolean(id),
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery<Message[]>({
    queryKey: queryKeys.conversations.messages(conversationId ?? ''),
    queryFn: () => api.getMessages(conversationId as string),
    enabled: Boolean(conversationId),
  });
}
