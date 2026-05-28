'use client';

import { useConversationsRealtime } from '@/features/conversations/realtime/use-conversations-realtime';

/** Subscribes to inbox Socket.IO events and patches React Query caches. */
export function ConversationsRealtimeBridge(): null {
  useConversationsRealtime();
  return null;
}
