import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminPlan,
  getAdminPlans,
  updateAdminPlan,
  updateAdminPlanStatus,
} from '@/lib/api/admin-hub';
import { invalidateAdminPlanCatalog } from '@/lib/admin/admin-hub-query-invalidation';
import { queryKeys } from '@/lib/hooks/query-keys';
import type {
  AdminPlan,
  AdminPlanListFilters,
  AdminUpdatePlanDto,
  AdminUpdatePlanStatusDto,
  AdminWritePlanDto,
} from '@/lib/types/admin-hub';

const ADMIN_PLANS_STALE_MS = 1000 * 60 * 5;

export function useAdminPlans(filters: AdminPlanListFilters = {}, enabled = true) {
  return useQuery<AdminPlan[]>({
    queryKey: queryKeys.admin.plans.list(filters),
    queryFn: () => getAdminPlans(filters),
    enabled,
    staleTime: ADMIN_PLANS_STALE_MS,
  });
}

function useInvalidatePlanCatalog() {
  const qc = useQueryClient();
  return (): void => {
    invalidateAdminPlanCatalog(qc);
  };
}

export function useAdminCreatePlan() {
  const invalidate = useInvalidatePlanCatalog();
  return useMutation<AdminPlan, Error, AdminWritePlanDto>({
    mutationFn: createAdminPlan,
    onSuccess: invalidate,
  });
}

export function useAdminUpdatePlan() {
  const invalidate = useInvalidatePlanCatalog();
  return useMutation<AdminPlan, Error, { planId: string; dto: AdminUpdatePlanDto }>({
    mutationFn: ({ planId, dto }) => updateAdminPlan(planId, dto),
    onSuccess: invalidate,
  });
}

export function useAdminUpdatePlanStatus() {
  const invalidate = useInvalidatePlanCatalog();
  return useMutation<AdminPlan, Error, { planId: string; dto: AdminUpdatePlanStatusDto }>({
    mutationFn: ({ planId, dto }) => updateAdminPlanStatus(planId, dto),
    onSuccess: invalidate,
  });
}
