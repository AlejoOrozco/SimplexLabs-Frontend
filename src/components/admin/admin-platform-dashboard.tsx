'use client';

import { Building2, DollarSign, MoreHorizontal, Users, Workflow } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SkeletonCard, SkeletonStat } from '@/components/shared/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { buildAdminPlatformOverview } from '@/lib/admin/build-admin-platform-overview';
import { getMe } from '@/lib/api/auth.api';
import { getAdminDashboardStats, getAdminSubscriptionBillingOverview } from '@/lib/api/admin-dashboard.api';
import { getPayments } from '@/lib/api/payments.api';
import { getAppointments } from '@/lib/api/appointments.api';
import { getCompanies } from '@/lib/api/companies.api';
import { getOrders } from '@/lib/api/orders.api';
import { getSubscriptions } from '@/lib/api/subscriptions.api';
import { useAdminAgentFailureCount } from '@/lib/hooks/use-admin-agent-failures';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { AuthenticatedUser } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils/format';

function getGreeting(hour: number): string {
  if (hour >= 6 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  if (hour >= 18 && hour < 22) return 'Good evening';
  return 'Working late,';
}

export function AdminPlatformDashboard(): JSX.Element {
  const meQuery = useQuery<AuthenticatedUser>({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
  });
  const companiesQuery = useQuery({ queryKey: queryKeys.companies.list(), queryFn: getCompanies });
  const subscriptionsQuery = useQuery({
    queryKey: queryKeys.subscriptions.list(),
    queryFn: getSubscriptions,
  });
  const ordersQuery = useQuery({ queryKey: queryKeys.orders.list(), queryFn: getOrders });
  const paymentsQuery = useQuery({
    queryKey: ['payments', 'admin-overview'],
    queryFn: () => getPayments(),
  });
  const billingOverviewQuery = useQuery({
    queryKey: ['subscriptions', 'admin', 'billing-overview'],
    queryFn: getAdminSubscriptionBillingOverview,
    staleTime: 60_000,
  });
  const adminStatsQuery = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: getAdminDashboardStats,
    staleTime: 60_000,
  });
  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.list(),
    queryFn: getAppointments,
  });
  const failuresQuery = useAdminAgentFailureCount();

  const isLoadingCore =
    meQuery.isLoading ||
    companiesQuery.isLoading ||
    subscriptionsQuery.isLoading ||
    ordersQuery.isLoading ||
    paymentsQuery.isLoading ||
    appointmentsQuery.isLoading;

  const isErrorCore =
    meQuery.isError ||
    companiesQuery.isError ||
    subscriptionsQuery.isError ||
    ordersQuery.isError ||
    paymentsQuery.isError ||
    appointmentsQuery.isError;

  const model = useMemo(() => {
    if (isLoadingCore || isErrorCore) return null;
    const agentFailureCount = failuresQuery.isSuccess ? failuresQuery.data : null;
    return buildAdminPlatformOverview({
      companies: companiesQuery.data ?? [],
      subscriptions: subscriptionsQuery.data ?? [],
      orders: ordersQuery.data ?? [],
      payments: paymentsQuery.data ?? [],
      appointments: appointmentsQuery.data ?? [],
      agentFailureCount,
    });
  }, [
    appointmentsQuery.data,
    companiesQuery.data,
    failuresQuery.data,
    failuresQuery.isSuccess,
    isErrorCore,
    isLoadingCore,
    ordersQuery.data,
    paymentsQuery.data,
    subscriptionsQuery.data,
  ]);

  const greeting = getGreeting(new Date().getHours());
  const adminFirstName = meQuery.data?.firstName ?? 'Admin';

  if (isLoadingCore) {
    return (
      <section className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStat key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (isErrorCore || !model) {
    return (
      <div className="rounded-lg border border-error bg-error-light p-4">
        <p className="font-medium text-error-dark">Could not load platform metrics.</p>
      </div>
    );
  }

  const failureDisplay = failuresQuery.isPending
    ? '…'
    : failuresQuery.isError || model.agentFailureCount === null
      ? '—'
      : String(model.agentFailureCount);

  const billing = billingOverviewQuery.data;
  const adminStats = adminStatsQuery.data;
  const mrrDisplay = billing ? billing.mrrCents / 100 : model.estimatedMrr;
  const activeClientsDisplay = adminStats?.activeCompanies ?? model.activeClients;

  return (
    <section className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-text-primary">
          {greeting}, {adminFirstName}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">SimplexLabs platform overview</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Users className="h-4 w-4 shrink-0" aria-hidden />
            Active clients
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{activeClientsDisplay}</p>
          <p className="mt-1 text-xs text-text-secondary">Companies with an active subscription</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Building2 className="h-4 w-4 shrink-0" aria-hidden />
            Total companies
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{model.totalCompanies}</p>
          <p className="mt-1 text-xs text-text-secondary">Registered organizations</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <DollarSign className="h-4 w-4 shrink-0" aria-hidden />
            Est. MRR
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{formatCurrency(mrrDisplay)}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {billing ? 'MRR from billing service' : 'Sum of active plan prices*'}
          </p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Workflow className="h-4 w-4 shrink-0" aria-hidden />
            Agent failures
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{failureDisplay}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {failuresQuery.isPending
              ? 'Loading failure count…'
              : failuresQuery.isError || model.agentFailureCount === null
                ? 'Metric unavailable until /admin/metrics/agent-failures exists'
                : 'Open DLQ for details'}
          </p>
        </div>
      </div>

      {!billing ? (
        <p className="text-xs text-text-secondary">
          *MRR is an estimate from each client&apos;s current active plan list price; actual billing may differ.
        </p>
      ) : null}

      {billing && (billing.dueSoon.length > 0 || billing.overdue.length > 0) ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border-default bg-surface-page p-4">
            <h3 className="text-sm font-semibold text-text-primary">Due soon</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {billing.dueSoon.length === 0 ? (
                <li className="text-text-secondary">No invoices due soon.</li>
              ) : (
                billing.dueSoon.map((row) => (
                  <li key={row.companyId} className="flex justify-between gap-2">
                    <span className="text-text-primary">{row.companyName}</span>
                    <span className="tabular-nums text-text-secondary">
                      {formatCurrency(row.amountCents / 100)} · {formatDate(row.dueDate)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-lg border border-border-default bg-surface-page p-4">
            <h3 className="text-sm font-semibold text-text-primary">Overdue</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {billing.overdue.length === 0 ? (
                <li className="text-text-secondary">Nothing overdue.</li>
              ) : (
                billing.overdue.map((row) => (
                  <li key={`${row.companyId}-over`} className="flex justify-between gap-2">
                    <span className="text-text-primary">{row.companyName}</span>
                    <span className="tabular-nums text-text-secondary">
                      {formatCurrency(row.amountCents / 100)} · {formatDate(row.dueDate)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
      <>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <h3 className="text-sm font-semibold text-text-primary">Agent revenue</h3>
          <p className="text-xs text-text-secondary">Confirmed platform payments this month</p>
          <p className="mt-4 text-3xl font-semibold tabular-nums">{formatCurrency(model.agentRevenueMonth)}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <h3 className="text-sm font-semibold text-text-primary">Upcoming appointments</h3>
          <p className="text-xs text-text-secondary">With clients (next 8)</p>
          <ul className="mt-4 space-y-2">
            {model.upcomingAppointments.length === 0 ? (
              <li className="text-sm text-text-secondary">No upcoming appointments.</li>
            ) : (
              model.upcomingAppointments.map((item) => (
                <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium text-text-primary">
                    {item.companyName} — {item.title}
                  </span>
                  <span className="text-text-secondary">{item.whenLabel}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-border-default bg-surface-page p-4">
        <h3 className="text-sm font-semibold text-text-primary">Client overview</h3>
        <p className="mb-4 text-xs text-text-secondary">
          Per-company revenue uses completed orders this month (payment attribution coming later).
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">MRR</TableHead>
              <TableHead className="text-right">Agent revenue</TableHead>
              <TableHead className="w-10 text-right" aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {model.clientRows.map((row) => (
              <TableRow key={row.companyId}>
                <TableCell className="font-medium">
                  <Link href={`/admin/clients/${row.companyId}`} className="text-text-brand hover:underline">
                    {row.companyName}
                  </Link>
                </TableCell>
                <TableCell>{row.planName}</TableCell>
                <TableCell>{row.statusLabel}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(row.mrr)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.agentRevenueMonth)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" aria-label={`Actions for ${row.companyName}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/clients/${row.companyId}`}>Client workspace</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/companies">Companies</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/inbox">Inbox</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/failed-tasks">Failed tasks</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </>
    </section>
  );
}
