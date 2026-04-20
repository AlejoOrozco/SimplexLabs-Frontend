import { z } from 'zod';
import { OrderStatus } from '@/lib/types';

export const createOrderSchema = z.object({
  contactId: z.string().cuid('Invalid contact'),
  productId: z.string().cuid('Invalid product'),
  amount: z.number().nonnegative('Amount must be >= 0'),
  notes: z.string().max(2000).nullish(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  reason: z.string().max(500).nullish(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
