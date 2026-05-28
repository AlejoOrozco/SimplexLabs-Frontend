import type { ControlMode, LastMessagePreview, Message, SenderType } from '@/lib/api/endpoints';

export const REALTIME_EVENTS = {
  CONVERSATION_CREATED: 'conversation.created',
  CONVERSATION_UPDATED: 'conversation.updated',
  CONVERSATION_CONTROL_CHANGED: 'conversation.control_changed',
  MESSAGE_CREATED: 'message.created',
} as const;

export type RealtimeConversationEventType =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export interface MessageCreatedPayload {
  id: string;
  conversationId: string;
  companyId: string;
  senderType: SenderType;
  content: string;
  metadata: unknown;
  sentAt: string;
  deliveredAt: string | null;
  agentRunId: string | null;
}

export interface ConversationRealtimePayload {
  conversationId: string;
  companyId: string;
  controlMode?: ControlMode;
  controlledByUserId?: string | null;
  controlModeChangedAt?: string | null;
  updatedAt?: string;
  lastMessage?: LastMessagePreview | null;
  unreadCount?: number;
}

export type ConversationRealtimeEvent =
  | {
      type: typeof REALTIME_EVENTS.CONVERSATION_CREATED;
      eventId: string;
      at: string;
      payload: ConversationRealtimePayload;
    }
  | {
      type: typeof REALTIME_EVENTS.CONVERSATION_UPDATED;
      eventId: string;
      at: string;
      payload: ConversationRealtimePayload;
    }
  | {
      type: typeof REALTIME_EVENTS.CONVERSATION_CONTROL_CHANGED;
      eventId: string;
      at: string;
      payload: ConversationRealtimePayload;
    }
  | {
      type: typeof REALTIME_EVENTS.MESSAGE_CREATED;
      eventId: string;
      at: string;
      payload: MessageCreatedPayload;
    };

export function messagePayloadToMessage(payload: MessageCreatedPayload): Message {
  return {
    id: payload.id,
    conversationId: payload.conversationId,
    senderType: payload.senderType,
    content: payload.content,
    sentAt: payload.sentAt,
    deliveredAt: payload.deliveredAt,
    metadata:
      payload.metadata && typeof payload.metadata === 'object' && !Array.isArray(payload.metadata)
        ? (payload.metadata as Record<string, unknown>)
        : null,
  };
}
