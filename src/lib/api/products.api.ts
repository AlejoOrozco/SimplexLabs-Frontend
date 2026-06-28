import { apiGet } from '@/lib/api/client';
import type { Product } from '@/lib/types';

export async function getProducts(): Promise<Product[]> {
  return apiGet<Product[]>('/products');
}
