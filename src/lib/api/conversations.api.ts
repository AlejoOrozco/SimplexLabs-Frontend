import {
  getConversation as getConversationDetail,
  getConversationMessages,
  listConversations,
} from '@/features/conversations/api/conversations.api';
import type { ConversationDetail, ConversationListItem } from '@/lib/api/endpoints';
import type { Channel } from '@/lib/types';

/** @deprecated Prefer {@link ConversationListItem} from `@/lib/api/endpoints`. */
export type Conversation = ConversationListItem;

export async function getConversations(channel?: Channel): Promise<ConversationListItem[]> {
  return listConversations(channel ? { channel } : undefined);
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  return getConversationDetail(id);
}

export { getConversationMessages as getMessages };
