import { z } from 'zod';
import { SubStatus } from '@/lib/types';

const billingCycleSchema = z.enum(['MONTHLY', 'ANNUAL']);

export const adminAssignSubscriptionSchema = z.object({
  planId: z.string().min(1, 'Plan is required'),
  billingCycle: billingCycleSchema,
  status: z.nativeEnum(SubStatus).optional(),
  initialPayment: z.number().nonnegative().nullish(),
  startedAt: z.string().datetime({ message: 'Start date is required' }),
  nextBillingAt: z.string().datetime().nullish(),
  replaceExisting: z.boolean().optional(),
});

export const adminUpdateSubscriptionSchema = z.object({
  status: z.nativeEnum(SubStatus).optional(),
  billingCycle: billingCycleSchema.optional(),
  initialPayment: z.number().nonnegative().nullish(),
  startedAt: z.string().datetime().optional(),
  nextBillingAt: z.string().datetime().nullish(),
});

export const adminSwapSubscriptionPlanSchema = z.object({
  planId: z.string().min(1, 'Plan is required'),
  billingCycle: billingCycleSchema.optional(),
  initialPayment: z.number().nonnegative().nullish(),
  effectiveAt: z.string().datetime().optional(),
});

export const adminCancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type AdminAssignSubscriptionFormValues = z.infer<typeof adminAssignSubscriptionSchema>;
export type AdminUpdateSubscriptionFormValues = z.infer<typeof adminUpdateSubscriptionSchema>;
export type AdminSwapSubscriptionPlanFormValues = z.infer<typeof adminSwapSubscriptionPlanSchema>;
export type AdminCancelSubscriptionFormValues = z.infer<typeof adminCancelSubscriptionSchema>;
