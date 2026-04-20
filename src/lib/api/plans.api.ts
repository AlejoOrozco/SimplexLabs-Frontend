import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { CreatePlanDto, UpdatePlanDto } from '@/lib/schemas/plan.schema';
import type { Plan } from '@/lib/types';

export async function getPlans(): Promise<Plan[]> {
  return apiGet<Plan[]>('/plans');
}

export async function getPlan(id: string): Promise<Plan> {
  return apiGet<Plan>(`/plans/${id}`);
}

export async function createPlan(dto: CreatePlanDto): Promise<Plan> {
  return apiPost<Plan, CreatePlanDto>('/plans', dto);
}

export async function updatePlan(id: string, dto: UpdatePlanDto): Promise<Plan> {
  return apiPut<Plan, UpdatePlanDto>(`/plans/${id}`, dto);
}

export async function deletePlan(id: string): Promise<void> {
  await apiDelete<void>(`/plans/${id}`);
}
