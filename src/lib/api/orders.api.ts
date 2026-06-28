import { apiGet } from '@/lib/api/client';
import type { Order, OrderStatusHistory } from '@/lib/types';

export async function getOrders(): Promise<Order[]> {
  return apiGet<Order[]>('/orders');
}

export async function getOrderHistory(id: string): Promise<OrderStatusHistory[]> {
  return apiGet<OrderStatusHistory[]>(`/orders/${id}/history`);
}
