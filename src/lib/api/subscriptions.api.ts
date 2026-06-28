import { apiGet } from '@/lib/api/client';
import type { Subscription } from '@/lib/types';

export async function getSubscriptions(): Promise<Subscription[]> {
  return apiGet<Subscription[]>('/subscriptions');
}
