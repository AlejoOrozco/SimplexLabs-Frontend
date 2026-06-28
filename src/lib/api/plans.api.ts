import { apiGet } from '@/lib/api/client';
import type { Plan } from '@/lib/types';

export async function getPlans(): Promise<Plan[]> {
  return apiGet<Plan[]>('/plans');
}
