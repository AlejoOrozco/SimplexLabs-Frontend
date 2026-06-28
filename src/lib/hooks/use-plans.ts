import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api/plans.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { Plan } from '@/lib/types';

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: queryKeys.plans.list(),
    queryFn: api.getPlans,
  });
}
