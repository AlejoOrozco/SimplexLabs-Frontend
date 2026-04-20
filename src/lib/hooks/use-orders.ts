import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/orders.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { CreateOrderDto, UpdateOrderStatusDto } from '@/lib/schemas/order.schema';
import type { Order, OrderStatusHistory } from '@/lib/types';

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: queryKeys.orders.list(),
    queryFn: api.getOrders,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery<Order>({
    queryKey: queryKeys.orders.detail(id ?? ''),
    queryFn: () => api.getOrder(id as string),
    enabled: Boolean(id),
  });
}

export function useOrderHistory(id: string | undefined) {
  return useQuery<OrderStatusHistory[]>({
    queryKey: queryKeys.orders.history(id ?? ''),
    queryFn: () => api.getOrderHistory(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation<Order, Error, CreateOrderDto>({
    mutationFn: api.createOrder,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.orders.list() });
    },
  });
}

export function useUpdateOrderStatus(id: string) {
  const qc = useQueryClient();
  return useMutation<Order, Error, UpdateOrderStatusDto>({
    mutationFn: (dto) => api.updateOrderStatus(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.orders.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.orders.history(id) });
    },
  });
}
