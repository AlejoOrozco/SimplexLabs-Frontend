import { apiGet } from '@/lib/api/client';
import type { Payment } from '@/lib/api/endpoints';

export async function getPayments(): Promise<Payment[]> {
  return apiGet<Payment[]>('/payments');
}
