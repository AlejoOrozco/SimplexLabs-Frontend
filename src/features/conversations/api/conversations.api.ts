import { apiFetch } from '@/lib/api/client';
import {
  endpoints,
  type Channel,
  type ConversationControlResponse,
  type ConversationDetail,
  type ConversationListItem,
  type ConvoStatus,
  type Message,
} from '@/lib/api/endpoints';
import { createIdempotencyKey } from '@/lib/api/idempotency';
import { unwrapListItems } from '@/features/conversations/api/normalize-list-response';

export interface ListConversationsParams {
  channel?: Channel;
  status?: ConvoStatus;
  limit?: number;
  offset?: number;
}

export async function listConversations(
  params?: ListConversationsParams,
): Promise<ConversationListItem[]> {
  const data = await apiFetch<ConversationListItem[] | { items: ConversationListItem[] }>(
    endpoints.conversations.list.path,
    {
      method: 'GET',
      query: params,
      isIdempotent: true,
    },
  );
  return unwrapListItems(data);
}

/** @deprecated Prefer {@link listConversations}. */
export const getConversations = listConversations;

export async function getConversation(conversationId: string): Promise<ConversationDetail> {
  return apiFetch(endpoints.conversations.getById.path.replace(':id', conversationId), {
    method: 'GET',
    isIdempotent: true,
  });
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const data = await apiFetch<Message[] | { items: Message[] }>(
    endpoints.conversations.messages.path.replace(':id', conversationId),
    {
      method: 'GET',
      isIdempotent: true,
    },
  );
  return unwrapListItems(data);
}

export async function sendConversationMessage(
  conversationId: string,
  content: string,
): Promise<Message> {
  return apiFetch(endpoints.conversations.sendMessage.path.replace(':id', conversationId), {
    method: 'POST',
    body: { content },
    headers: { 'x-idempotency-key': createIdempotencyKey() },
    isIdempotent: false,
  });
}

export async function takeoverConversation(
  conversationId: string,
  reason?: string,
): Promise<ConversationControlResponse> {
  return apiFetch(endpoints.conversations.takeover.path.replace(':id', conversationId), {
    method: 'POST',
    body: reason ? { reason } : undefined,
    headers: { 'x-idempotency-key': createIdempotencyKey() },
    isIdempotent: false,
  });
}

export async function handbackConversation(
  conversationId: string,
): Promise<ConversationControlResponse> {
  return apiFetch(endpoints.conversations.handback.path.replace(':id', conversationId), {
    method: 'POST',
    headers: { 'x-idempotency-key': createIdempotencyKey() },
    isIdempotent: false,
  });
}
