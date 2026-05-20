import type { Payment } from '@/lib/api/endpoints';
import type { Appointment, Company, Order, Subscription } from '@/lib/types';
import { OrderStatus, SubStatus } from '@/lib/types';
import { subStatusLabel } from '@/lib/utils/format';

export interface AdminClientOverviewRow {
  companyId: string;
  companyName: string;
  planName: string;
  statusLabel: string;
  mrr: number;
  /** Completed order volume this calendar month (proxy until payments are attributed per company). */
  agentRevenueMonth: number;
}

export interface AdminPlatformAppointmentLine {
  id: string;
  title: string;
  companyName: string;
  whenLabel: string;
}

export interface AdminPlatformOverviewModel {
  activeClients: number;
  totalCompanies: number;
  estimatedMrr: number;
  agentFailureCount: number | null;
  agentRevenueMonth: number;
  upcomingAppointments: AdminPlatformAppointmentLine[];
  clientRows: AdminClientOverviewRow[];
}

function isCurrentMonth(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function pickSubscriptionForCompany(
  subscriptions: Subscription[],
  companyId: string,
): Subscription | undefined {
  const forCompany = subscriptions.filter((s) => s.companyId === companyId);
  const active = forCompany.find((s) => s.status === SubStatus.ACTIVE);
  return active ?? forCompany[0];
}

function completedOrderRevenueByCompanyThisMonth(orders: Order[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const order of orders) {
    if (order.status !== OrderStatus.COMPLETED) continue;
    if (!isCurrentMonth(order.createdAt)) continue;
    map.set(order.companyId, (map.get(order.companyId) ?? 0) + order.amount);
  }
  return map;
}

function confirmedPaymentsTotalThisMonth(payments: Payment[]): number {
  return payments
    .filter((p) => p.status === 'CONFIRMED' && isCurrentMonth(p.createdAt))
    .reduce((sum, p) => sum + p.amount, 0);
}

export function buildAdminPlatformOverview(input: {
  companies: Company[];
  subscriptions: Subscription[];
  orders: Order[];
  payments: Payment[];
  appointments: Appointment[];
  agentFailureCount: number | null;
}): AdminPlatformOverviewModel {
  const { companies, subscriptions, orders, payments, appointments, agentFailureCount } = input;

  const activeCompanyIds = new Set(
    subscriptions.filter((s) => s.status === SubStatus.ACTIVE).map((s) => s.companyId),
  );

  const mrrByCompany = new Map<string, number>();
  for (const s of subscriptions) {
    if (s.status !== SubStatus.ACTIVE || !s.plan) continue;
    mrrByCompany.set(s.companyId, s.plan.priceMonthly);
  }
  const estimatedMrr = [...mrrByCompany.values()].reduce((sum, n) => sum + n, 0);

  const orderRevenueByCompany = completedOrderRevenueByCompanyThisMonth(orders);

  const companyById = new Map(companies.map((c) => [c.id, c]));

  const clientRows: AdminClientOverviewRow[] = companies.map((company) => {
    const sub = pickSubscriptionForCompany(subscriptions, company.id);
    const planName = sub?.plan?.name ?? '—';
    const statusLabel = sub ? subStatusLabel(sub.status) : '—';
    const mrr =
      sub?.status === SubStatus.ACTIVE && sub.plan ? sub.plan.priceMonthly : 0;
    const agentRevenueMonth = orderRevenueByCompany.get(company.id) ?? 0;
    return {
      companyId: company.id,
      companyName: company.name,
      planName,
      statusLabel,
      mrr,
      agentRevenueMonth,
    };
  });

  clientRows.sort((a, b) => a.companyName.localeCompare(b.companyName));

  const now = Date.now();
  const upcomingAppointments: AdminPlatformAppointmentLine[] = [...appointments]
    .filter((a) => new Date(a.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 8)
    .map((a) => {
      const companyName = companyById.get(a.companyId)?.name ?? 'Company';
      const when = new Date(a.scheduledAt);
      return {
        id: a.id,
        title: a.title,
        companyName,
        whenLabel: when.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      };
    });

  return {
    activeClients: activeCompanyIds.size,
    totalCompanies: companies.length,
    estimatedMrr,
    agentFailureCount,
    agentRevenueMonth: confirmedPaymentsTotalThisMonth(payments),
    upcomingAppointments,
    clientRows,
  };
}
