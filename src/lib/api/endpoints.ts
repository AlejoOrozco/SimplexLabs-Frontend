import { z } from 'zod';
import { listQuerySchema, paginatedResponseSchema } from '@/lib/api/pagination';

const roleSchema = z.enum(['CLIENT', 'SUPER_ADMIN']);
const senderTypeSchema = z.enum(['CONTACT', 'AGENT', 'HUMAN']);
const controlModeSchema = z.enum(['AGENT', 'HUMAN']);
const channelSchema = z.enum(['WHATSAPP', 'INSTAGRAM', 'MESSENGER']);

const userSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  role: roleSchema,
  companyId: z.string().uuid().nullable(),
});

const sessionSchema = z.object({
  user: userSchema,
  role: roleSchema,
  companyId: z.string().uuid().nullable(),
});

const contactSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
});

const conversationSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  channel: channelSchema,
  lifecycleStatus: z.string(),
  controlMode: controlModeSchema,
  controlledByUserId: z.string().uuid().nullable(),
  updatedAt: z.string(),
  lastCustomerMessageAt: z.string().nullable(),
  lastReadAtByOperator: z.string().nullable().optional(),
  contact: contactSchema,
});

const messageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderType: senderTypeSchema,
  content: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  sentAt: z.string(),
  deliveredAt: z.string().nullable(),
});

const appointmentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED']),
  scheduledAt: z.string(),
  durationMinutes: z.number().int(),
  conversationId: z.string().uuid().nullable(),
  staffId: z.string().uuid().nullable(),
});

const paymentSchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  method: z.enum(['STRIPE', 'WIRE_TRANSFER']),
  status: z.string(),
  checkoutUrl: z.string().url().nullable().optional(),
  createdAt: z.string(),
});

const notificationSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['info', 'alert', 'action_required']),
  title: z.string(),
  body: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
  resourceType: z.string().nullable(),
  resourceId: z.string().nullable(),
});

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface EndpointDef<TPath, TQuery, TBody, TResponse> {
  path: string;
  method: Method;
  pathParams?: z.ZodType<TPath>;
  query?: z.ZodType<TQuery>;
  body?: z.ZodType<TBody>;
  response: z.ZodType<TResponse>;
  isIdempotent: boolean;
}

function endpoint<TPath = never, TQuery = never, TBody = never, TResponse = never>(
  value: EndpointDef<TPath, TQuery, TBody, TResponse>,
): EndpointDef<TPath, TQuery, TBody, TResponse> {
  return value;
}

export const endpoints = {
  auth: {
    me: endpoint({
      path: '/auth/me',
      method: 'GET',
      response: sessionSchema,
      isIdempotent: true,
    }),
    login: endpoint({
      path: '/auth/login',
      method: 'POST',
      body: z.object({ email: z.string().email(), password: z.string().min(8) }),
      response: sessionSchema,
      isIdempotent: false,
    }),
    register: endpoint({
      path: '/auth/register',
      method: 'POST',
      body: z.object({ email: z.string().email(), password: z.string().min(8), firstName: z.string(), lastName: z.string() }),
      response: sessionSchema,
      isIdempotent: false,
    }),
    refresh: endpoint({
      path: '/auth/refresh',
      method: 'POST',
      response: sessionSchema,
      isIdempotent: true,
    }),
    logout: endpoint({
      path: '/auth/logout',
      method: 'POST',
      response: z.object({ success: z.literal(true) }).passthrough(),
      isIdempotent: false,
    }),
  },
  conversations: {
    list: endpoint({
      path: '/conversations',
      method: 'GET',
      query: listQuerySchema.extend({
        lifecycleStatus: z.array(z.string()).optional(),
        channel: channelSchema.optional(),
        controlMode: controlModeSchema.optional(),
        unread: z.boolean().optional(),
        updatedSince: z.string().optional(),
      }),
      response: paginatedResponseSchema(conversationSchema),
      isIdempotent: true,
    }),
    getById: endpoint({
      path: '/conversations/:id',
      method: 'GET',
      pathParams: z.object({ id: z.string().uuid() }),
      response: conversationSchema,
      isIdempotent: true,
    }),
    messages: endpoint({
      path: '/conversations/:id/messages',
      method: 'GET',
      pathParams: z.object({ id: z.string().uuid() }),
      query: listQuerySchema.extend({ since: z.string().optional() }),
      response: paginatedResponseSchema(messageSchema),
      isIdempotent: true,
    }),
    sendMessage: endpoint({
      path: '/conversations/:id/messages',
      method: 'POST',
      pathParams: z.object({ id: z.string().uuid() }),
      body: z.object({ content: z.string().min(1).max(4096) }),
      response: messageSchema,
      isIdempotent: false,
    }),
    takeover: endpoint({
      path: '/conversations/:id/takeover',
      method: 'POST',
      pathParams: z.object({ id: z.string().uuid() }),
      body: z.object({ reason: z.string().max(200).optional() }).optional(),
      response: z.object({
        conversationId: z.string().uuid(),
        controlMode: controlModeSchema,
        controlledByUserId: z.string().uuid().nullable(),
        controlModeChangedAt: z.string(),
      }).passthrough(),
      isIdempotent: false,
    }),
    handback: endpoint({
      path: '/conversations/:id/handback',
      method: 'POST',
      pathParams: z.object({ id: z.string().uuid() }),
      response: z.object({
        conversationId: z.string().uuid(),
        controlMode: controlModeSchema,
        controlledByUserId: z.string().uuid().nullable(),
        controlModeChangedAt: z.string(),
      }).passthrough(),
      isIdempotent: false,
    }),
  },
  appointments: {
    list: endpoint({
      path: '/appointments',
      method: 'GET',
      query: listQuerySchema.extend({ status: z.string().optional() }),
      response: paginatedResponseSchema(appointmentSchema),
      isIdempotent: true,
    }),
    confirm: endpoint({
      path: '/appointments/:id/confirm',
      method: 'POST',
      pathParams: z.object({ id: z.string().uuid() }),
      response: appointmentSchema,
      isIdempotent: false,
    }),
    reject: endpoint({
      path: '/appointments/:id/reject',
      method: 'POST',
      pathParams: z.object({ id: z.string().uuid() }),
      body: z.object({ reason: z.string().max(240).optional() }),
      response: appointmentSchema,
      isIdempotent: false,
    }),
  },
  payments: {
    list: endpoint({
      path: '/payments',
      method: 'GET',
      query: listQuerySchema.extend({ status: z.string().optional() }),
      response: paginatedResponseSchema(paymentSchema),
      isIdempotent: true,
    }),
    getById: endpoint({
      path: '/payments/:id',
      method: 'GET',
      pathParams: z.object({ id: z.string().uuid() }),
      response: paymentSchema,
      isIdempotent: true,
    }),
    confirmWire: endpoint({
      path: '/payments/:id/confirm-wire',
      method: 'POST',
      pathParams: z.object({ id: z.string().uuid() }),
      body: z.object({ note: z.string().min(3).max(240) }),
      response: paymentSchema,
      isIdempotent: false,
    }),
    rejectWire: endpoint({
      path: '/payments/:id/reject-wire',
      method: 'POST',
      pathParams: z.object({ id: z.string().uuid() }),
      body: z.object({ note: z.string().min(3).max(240) }),
      response: paymentSchema,
      isIdempotent: false,
    }),
  },
  notifications: {
    list: endpoint({
      path: '/notifications',
      method: 'GET',
      query: listQuerySchema.extend({
        unread: z.boolean().optional(),
        type: z.enum(['info', 'alert', 'action_required']).optional(),
        since: z.string().optional(),
      }),
      response: paginatedResponseSchema(notificationSchema),
      isIdempotent: true,
    }),
    markRead: endpoint({
      path: '/notifications/mark-read/:id',
      method: 'POST',
      pathParams: z.object({ id: z.string().uuid() }),
      response: z.object({ id: z.string().uuid(), isRead: z.boolean() }),
      isIdempotent: true,
    }),
    markAllRead: endpoint({
      path: '/notifications/mark-all-read',
      method: 'POST',
      response: z.object({ updated: z.number().int() }).passthrough(),
      isIdempotent: true,
    }),
  },
} as const;

export const apiSuccessEnvelopeSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    success: z.literal(true),
    data: schema,
    timestamp: z.string(),
    correlationId: z.string(),
  });

export type Session = z.infer<typeof sessionSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type Notification = z.infer<typeof notificationSchema>;
