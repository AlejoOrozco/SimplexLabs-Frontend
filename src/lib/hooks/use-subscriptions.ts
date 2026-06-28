import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api/subscriptions.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { Subscription } from '@/lib/types';

export function useSubscriptions() {
  return useQuery<Subscription[]>({
    queryKey: queryKeys.subscriptions.list(),
    queryFn: api.getSubscriptions,
  });
}
