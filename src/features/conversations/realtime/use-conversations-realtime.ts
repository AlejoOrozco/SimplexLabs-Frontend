'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { applyConversationRealtimeEvent } from '@/features/conversations/realtime/conversation-cache-updates';
import { eventBus } from '@/lib/realtime/event-bus';
import { queryKeys } from '@/lib/hooks/query-keys';

const INBOX_THREAD_PATTERN = /^\/inbox\/([^/]+)/;

function getSelectedConversationId(pathname: string): string | null {
  const match = INBOX_THREAD_PATTERN.exec(pathname);
  return match?.[1] ?? null;
}

/**
 * Subscribes to Socket.IO conversation events (via event bus) and patches React Query caches.
 * Mount once inside authenticated app shell. SUPER_ADMIN without companyId will not receive
 * tenant events from the backend — list polling may still be needed in admin views.
 */
export function useConversationsRealtime(): void {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const selectedConversationId = getSelectedConversationId(pathname);
  const isThreadFocused = selectedConversationId !== null;

  useEffect(() => {
    const offCreated = eventBus.on('conversation:realtime', (event) => {
      applyConversationRealtimeEvent(queryClient, event, {
        selectedConversationId,
        isThreadFocused,
      });
    });

    const offReconnect = eventBus.on('socket:reconnected', () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      if (selectedConversationId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.detail(selectedConversationId),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.messages(selectedConversationId),
        });
      }
    });

    return () => {
      offCreated();
      offReconnect();
    };
  }, [queryClient, selectedConversationId, isThreadFocused]);
}
