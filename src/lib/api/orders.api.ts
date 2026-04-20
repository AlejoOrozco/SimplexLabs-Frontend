import { apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { CreateOrderDto, UpdateOrderStatusDto } from '@/lib/schemas/order.schema';
import type { Order, OrderStatusHistory } from '@/lib/types';

export async function getOrders(): Promise<Order[]> {
  return apiGet<Order[]>('/orders');
}

export async function getOrder(id: string): Promise<Order> {
  return apiGet<Order>(`/orders/${id}`);
}

export async function getOrderHistory(id: string): Promise<OrderStatusHistory[]> {
  return apiGet<OrderStatusHistory[]>(`/orders/${id}/history`);
}

export async function createOrder(dto: CreateOrderDto): Promise<Order> {
  return apiPost<Order, CreateOrderDto>('/orders', dto);
}

export async function updateOrderStatus(
  id: string,
  dto: UpdateOrderStatusDto,
): Promise<Order> {
  return apiPut<Order, UpdateOrderStatusDto>(`/orders/${id}/status`, dto);
}
