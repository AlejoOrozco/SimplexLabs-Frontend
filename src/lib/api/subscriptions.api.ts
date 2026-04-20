import { apiGet, apiPost, apiPut } from '@/lib/api/client';
import type {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '@/lib/schemas/subscription.schema';
import type { Subscription } from '@/lib/types';

export async function getSubscriptions(): Promise<Subscription[]> {
  return apiGet<Subscription[]>('/subscriptions');
}

export async function getSubscription(id: string): Promise<Subscription> {
  return apiGet<Subscription>(`/subscriptions/${id}`);
}

export async function createSubscription(
  dto: CreateSubscriptionDto,
): Promise<Subscription> {
  return apiPost<Subscription, CreateSubscriptionDto>('/subscriptions', dto);
}

export async function updateSubscription(
  id: string,
  dto: UpdateSubscriptionDto,
): Promise<Subscription> {
  return apiPut<Subscription, UpdateSubscriptionDto>(`/subscriptions/${id}`, dto);
}
