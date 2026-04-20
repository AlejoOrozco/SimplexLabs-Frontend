import { z } from 'zod';
import { ProductType } from '@/lib/types';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).nullish(),
  type: z.nativeEnum(ProductType),
  price: z.number().nonnegative('Price must be >= 0'),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
