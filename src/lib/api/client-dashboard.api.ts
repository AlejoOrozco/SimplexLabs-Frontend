import { apiGet } from '@/lib/api/client';

export interface ClientDashboardStats {
  revenueThisMonthCents: number;
  pendingOrders: number;
  appointmentsToday: number;
  openConversations: number;
}

export async function getClientDashboardStats(): Promise<ClientDashboardStats> {
  return apiGet<ClientDashboardStats>('/dashboard/company-stats');
}
