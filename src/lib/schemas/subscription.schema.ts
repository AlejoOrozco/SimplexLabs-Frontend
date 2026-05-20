import { z } from 'zod';
import { SubStatus } from '@/lib/types';

export const createSubscriptionSchema = z.object({
  planId: z.string().cuid(),
  status: z.nativeEnum(SubStatus).default(SubStatus.ACTIVE),
  initialPayment: z.number().nonnegative().nullish(),
  startedAt: z.string().datetime(),
  nextBillingAt: z.string().datetime().nullish(),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial().omit({
  planId: true,
});

export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionDto = z.infer<typeof updateSubscriptionSchema>;
