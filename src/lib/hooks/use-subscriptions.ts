import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/subscriptions.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '@/lib/schemas/subscription.schema';
import type { Subscription } from '@/lib/types';

export function useSubscriptions() {
  return useQuery<Subscription[]>({
    queryKey: queryKeys.subscriptions.list(),
    queryFn: api.getSubscriptions,
  });
}

export function useSubscription(id: string | undefined) {
  return useQuery<Subscription>({
    queryKey: queryKeys.subscriptions.detail(id ?? ''),
    queryFn: () => api.getSubscription(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation<Subscription, Error, CreateSubscriptionDto>({
    mutationFn: api.createSubscription,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.list() });
    },
  });
}

export function useUpdateSubscription(id: string) {
  const qc = useQueryClient();
  return useMutation<Subscription, Error, UpdateSubscriptionDto>({
    mutationFn: (dto) => api.updateSubscription(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.detail(id) });
    },
  });
}
