import { apiFetch } from '@/lib/api/client';
import { endpoints, type Conversation, type Message } from '@/lib/api/endpoints';
import { createIdempotencyKey } from '@/lib/api/idempotency';

export async function getConversations(): Promise<Conversation[]> {
  return apiFetch(endpoints.conversations.list.path, {
    method: 'GET',
    isIdempotent: true,
  });
}

export async function getConversation(conversationId: string): Promise<Conversation> {
  return apiFetch(endpoints.conversations.getById.path.replace(':id', conversationId), {
    method: 'GET',
    isIdempotent: true,
  });
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  return apiFetch(endpoints.conversations.messages.path.replace(':id', conversationId), {
    method: 'GET',
    isIdempotent: true,
  });
}

export async function sendConversationMessage(conversationId: string, content: string): Promise<Message> {
  return apiFetch(endpoints.conversations.sendMessage.path.replace(':id', conversationId), {
    method: 'POST',
    body: { content },
    headers: { 'x-idempotency-key': createIdempotencyKey() },
    isIdempotent: false,
  });
}
