import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api/orders.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { Order } from '@/lib/types';

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: queryKeys.orders.list(),
    queryFn: api.getOrders,
  });
}
