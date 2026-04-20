import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/plans.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { CreatePlanDto, UpdatePlanDto } from '@/lib/schemas/plan.schema';
import type { Plan } from '@/lib/types';

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: queryKeys.plans.list(),
    queryFn: api.getPlans,
  });
}

export function usePlan(id: string | undefined) {
  return useQuery<Plan>({
    queryKey: queryKeys.plans.detail(id ?? ''),
    queryFn: () => api.getPlan(id as string),
    enabled: Boolean(id),
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation<Plan, Error, CreatePlanDto>({
    mutationFn: api.createPlan,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.plans.list() });
    },
  });
}

export function useUpdatePlan(id: string) {
  const qc = useQueryClient();
  return useMutation<Plan, Error, UpdatePlanDto>({
    mutationFn: (dto) => api.updatePlan(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.plans.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.plans.detail(id) });
    },
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: api.deletePlan,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.plans.list() });
    },
  });
}
