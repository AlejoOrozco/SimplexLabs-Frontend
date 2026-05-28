import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type {
  ConversationDetail,
  ConversationListItem,
  LastMessagePreview,
  Message,
} from '@/lib/api/endpoints';
import {
  REALTIME_EVENTS,
  messagePayloadToMessage,
  type ConversationRealtimeEvent,
} from '@/lib/realtime/conversation-events';
import { queryKeys } from '@/lib/hooks/query-keys';

function patchListItem(
  item: ConversationListItem,
  patch: Partial<ConversationListItem>,
): ConversationListItem {
  return { ...item, ...patch };
}

function updateListQueries(
  queryClient: QueryClient,
  conversationId: string,
  updater: (item: ConversationListItem) => ConversationListItem,
): void {
  queryClient.setQueriesData<InfiniteData<ConversationListItem[]>>(
    { queryKey: queryKeys.conversations.all },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) =>
          page.map((item) => (item.id === conversationId ? updater(item) : item)),
        ),
      };
    },
  );
}

function appendMessageToThread(
  queryClient: QueryClient,
  conversationId: string,
  message: Message,
): void {
  queryClient.setQueryData<Message[]>(queryKeys.conversations.messages(conversationId), (old) => {
    if (!old) return [message];
    if (old.some((row) => row.id === message.id)) return old;
    return [...old, message];
  });
}

export function applyConversationRealtimeEvent(
  queryClient: QueryClient,
  event: ConversationRealtimeEvent,
  options: { selectedConversationId: string | null; isThreadFocused: boolean },
): void {
  const { selectedConversationId, isThreadFocused } = options;

  if (event.type === REALTIME_EVENTS.MESSAGE_CREATED) {
    const { payload } = event;
    const message = messagePayloadToMessage(payload);
    const lastMessage: LastMessagePreview = {
      content: payload.content,
      sentAt: payload.sentAt,
      senderType: payload.senderType,
    };

    if (payload.conversationId === selectedConversationId) {
      appendMessageToThread(queryClient, payload.conversationId, message);
    }

    updateListQueries(queryClient, payload.conversationId, (item) => {
      const shouldIncrementUnread =
        payload.senderType === 'CONTACT' &&
        (!isThreadFocused || payload.conversationId !== selectedConversationId);
      return patchListItem(item, {
        updatedAt: payload.sentAt,
        lastMessage,
        unreadCount: shouldIncrementUnread ? item.unreadCount + 1 : item.unreadCount,
      });
    });
    return;
  }

  const { payload } = event;
  const listPatch: Partial<ConversationListItem> = {
    updatedAt: payload.updatedAt ?? undefined,
    lastMessage: payload.lastMessage ?? undefined,
    unreadCount: payload.unreadCount ?? undefined,
    controlMode: payload.controlMode ?? undefined,
  };

  if (event.type === REALTIME_EVENTS.CONVERSATION_CREATED) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    return;
  }

  updateListQueries(queryClient, payload.conversationId, (item) => patchListItem(item, listPatch));

  if (payload.conversationId === selectedConversationId) {
    queryClient.setQueryData<ConversationDetail>(
      queryKeys.conversations.detail(payload.conversationId),
      (old) => {
        if (!old) return old;
        return {
          ...old,
          ...listPatch,
          controlledByUserId:
            payload.controlledByUserId !== undefined
              ? payload.controlledByUserId
              : old.controlledByUserId,
          controlMode: payload.controlMode ?? old.controlMode,
          controlModeChangedAt:
            payload.controlModeChangedAt ?? old.controlModeChangedAt ?? null,
        };
      },
    );
  }
}

export function clearUnreadForConversation(
  queryClient: QueryClient,
  conversationId: string,
): void {
  updateListQueries(queryClient, conversationId, (item) =>
    patchListItem(item, { unreadCount: 0 }),
  );
}
