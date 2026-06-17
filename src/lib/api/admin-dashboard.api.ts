import { apiGet } from '@/lib/api/client';

export interface AdminBillingDueItem {
  companyId: string;
  companyName: string;
  amountCents: number;
  dueDate: string;
}

export interface AdminBillingOverview {
  mrrCents: number;
  dueSoon: AdminBillingDueItem[];
  overdue: AdminBillingDueItem[];
}

export interface AdminDashboardStats {
  activeCompanies: number;
  inactiveCompanies?: number;
  totalUsers: number;
  appointmentsThisWeek: number;
}

export async function getAdminSubscriptionBillingOverview(): Promise<AdminBillingOverview> {
  return apiGet<AdminBillingOverview>('/subscriptions/admin/billing-overview');
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return apiGet<AdminDashboardStats>('/admin/dashboard-stats');
}
