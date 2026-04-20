import { apiGet } from '@/lib/api/client';
import type { Channel, Conversation, Message } from '@/lib/types';

export async function getConversations(channel?: Channel): Promise<Conversation[]> {
  return apiGet<Conversation[]>('/conversations', {
    params: channel ? { channel } : undefined,
  });
}

export async function getConversation(id: string): Promise<Conversation> {
  return apiGet<Conversation>(`/conversations/${id}`);
}

export async function getMessages(id: string): Promise<Message[]> {
  return apiGet<Message[]>(`/conversations/${id}/messages`);
}
