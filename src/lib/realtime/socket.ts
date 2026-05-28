'use client';

import { io, type Socket } from 'socket.io-client';
import { z } from 'zod';
import {
  REALTIME_EVENTS,
  type ConversationRealtimeEvent,
  type ConversationRealtimePayload,
  type MessageCreatedPayload,
} from '@/lib/realtime/conversation-events';
import { eventBus } from '@/lib/realtime/event-bus';
import { logger } from '@/lib/logger';

const baseEventSchema = z.object({
  eventId: z.string(),
  at: z.string(),
});

const conversationPayloadSchema = z
  .object({
    conversationId: z.string().uuid(),
    companyId: z.string().uuid(),
  })
  .passthrough();

const messageCreatedPayloadSchema = z
  .object({
    id: z.string().uuid(),
    conversationId: z.string().uuid(),
    companyId: z.string().uuid(),
    senderType: z.enum(['CONTACT', 'AGENT', 'HUMAN']),
    content: z.string(),
    sentAt: z.string(),
    deliveredAt: z.string().nullable(),
    agentRunId: z.string().uuid().nullable().optional(),
    metadata: z.unknown().optional(),
  })
  .passthrough();

const seenEvents: string[] = [];
let socket: Socket | null = null;

function rememberEvent(eventId: string): boolean {
  if (seenEvents.includes(eventId)) return false;
  seenEvents.push(eventId);
  if (seenEvents.length > 500) seenEvents.shift();
  return true;
}

function parseConversationEvent(
  eventName: string,
  payload: Record<string, unknown>,
): ConversationRealtimeEvent | null {
  const base = baseEventSchema.safeParse(payload);
  if (!base.success) return null;

  if (
    eventName === REALTIME_EVENTS.CONVERSATION_CREATED ||
    eventName === REALTIME_EVENTS.CONVERSATION_UPDATED ||
    eventName === REALTIME_EVENTS.CONVERSATION_CONTROL_CHANGED
  ) {
    const body = conversationPayloadSchema.safeParse(payload);
    if (!body.success) return null;
    return {
      type: eventName,
      eventId: base.data.eventId,
      at: base.data.at,
      payload: body.data as ConversationRealtimePayload,
    };
  }

  if (eventName === REALTIME_EVENTS.MESSAGE_CREATED) {
    const body = messageCreatedPayloadSchema.safeParse(payload);
    if (!body.success) return null;
    return {
      type: REALTIME_EVENTS.MESSAGE_CREATED,
      eventId: base.data.eventId,
      at: base.data.at,
      payload: body.data as MessageCreatedPayload,
    };
  }

  return null;
}

function dispatchConversationEvent(event: ConversationRealtimeEvent): void {
  eventBus.emit('conversation:realtime', event);
}

export function getSocket(): Socket {
  if (socket) return socket;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL missing');

  socket = io(`${apiUrl}/realtime`, {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30_000,
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    eventBus.emit('socket:connected', undefined);
  });

  socket.on('reconnect', () => {
    eventBus.emit('socket:reconnected', undefined);
  });

  socket.on('disconnect', () => {
    eventBus.emit('socket:disconnected', undefined);
  });

  socket.onAny((eventName, payload) => {
    if (typeof payload !== 'object' || payload === null) {
      logger.warn('Unknown realtime event dropped', { eventName });
      return;
    }
    const record = payload as Record<string, unknown>;
    const eventId = typeof record.eventId === 'string' ? record.eventId : null;
    if (!eventId) {
      logger.warn('Realtime event missing eventId', { eventName });
      return;
    }
    if (!rememberEvent(eventId)) return;

    const conversationEvent = parseConversationEvent(eventName, record);
    if (conversationEvent) {
      dispatchConversationEvent(conversationEvent);
      return;
    }

    const notificationTypes = new Set(['notification.created', 'notification.read']);
    if (!notificationTypes.has(eventName)) {
      logger.warn('Unknown realtime event dropped', { eventName });
    }
  });

  return socket;
}

export function disconnectSocket(): void {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
