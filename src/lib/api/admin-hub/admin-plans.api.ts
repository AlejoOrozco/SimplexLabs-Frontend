import { apiGet, apiPatch, apiPost, apiPut } from '@/lib/api/client';
import { toQueryRecord } from '@/lib/api/admin-hub/admin-hub-paths';
import type {
  AdminPlan,
  AdminPlanListFilters,
  AdminUpdatePlanDto,
  AdminUpdatePlanStatusDto,
  AdminWritePlanDto,
} from '@/lib/types/admin-hub';

export async function getAdminPlans(filters: AdminPlanListFilters = {}): Promise<AdminPlan[]> {
  return apiGet<AdminPlan[]>('/admin/plans', {
    params: toQueryRecord({
      niche: filters.niche,
      category: filters.category,
      tier: filters.tier,
      activeOnly: filters.activeOnly,
    }),
  });
}

export async function createAdminPlan(dto: AdminWritePlanDto): Promise<AdminPlan> {
  return apiPost<AdminPlan, AdminWritePlanDto>('/admin/plans', dto);
}

export async function updateAdminPlan(planId: string, dto: AdminUpdatePlanDto): Promise<AdminPlan> {
  return apiPut<AdminPlan, AdminUpdatePlanDto>(
    `/admin/plans/${encodeURIComponent(planId)}`,
    dto,
  );
}

export async function updateAdminPlanStatus(
  planId: string,
  dto: AdminUpdatePlanStatusDto,
): Promise<AdminPlan> {
  return apiPatch<AdminPlan, AdminUpdatePlanStatusDto>(
    `/admin/plans/${encodeURIComponent(planId)}/status`,
    dto,
  );
}
