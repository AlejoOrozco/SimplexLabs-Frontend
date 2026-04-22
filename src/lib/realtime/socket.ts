'use client';

import { io, type Socket } from 'socket.io-client';
import { z } from 'zod';
import { eventBus } from '@/lib/realtime/event-bus';
import { logger } from '@/lib/logger';

const baseEventSchema = z.object({
  eventId: z.string(),
  type: z.string(),
  at: z.string(),
});

const conversationEventSchema = baseEventSchema.extend({
  type: z.union([z.literal('conversation.created'), z.literal('conversation.updated')]),
  conversationId: z.string().uuid(),
  companyId: z.string().uuid(),
}).passthrough();

const messageEventSchema = baseEventSchema.extend({
  type: z.literal('message.created'),
  messageId: z.string().uuid(),
  conversationId: z.string().uuid(),
}).passthrough();

const notificationEventSchema = baseEventSchema.extend({
  type: z.union([z.literal('notification.created'), z.literal('notification.read')]),
  notificationId: z.string().uuid(),
}).passthrough();

export const realtimeEventSchema = z.union([
  conversationEventSchema,
  messageEventSchema,
  notificationEventSchema,
]);

const seenEvents: string[] = [];
let socket: Socket | null = null;

function rememberEvent(eventId: string): boolean {
  if (seenEvents.includes(eventId)) return false;
  seenEvents.push(eventId);
  if (seenEvents.length > 500) seenEvents.shift();
  return true;
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
    const candidate = {
      type: eventName,
      ...(payload as Record<string, unknown>),
    };
    const parsed = realtimeEventSchema.safeParse(candidate);
    if (!parsed.success) {
      logger.warn('Unknown realtime event dropped', { eventName });
      return;
    }
    if (!rememberEvent(parsed.data.eventId)) return;
  });

  return socket;
}

export function disconnectSocket(): void {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
