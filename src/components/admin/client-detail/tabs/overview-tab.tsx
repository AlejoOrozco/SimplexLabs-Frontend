'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConversations } from '@/features/conversations/api/conversations.api';
import { adminCompanyWorkspaceHref } from '@/lib/admin/admin-company-workspace-href';
import { useOrders } from '@/lib/hooks/use-orders';
import { OrderStatus } from '@/lib/types';

interface OverviewTabProps {
  companyId: string;
}

export function OverviewTab({ companyId }: OverviewTabProps): JSX.Element {
  const ordersQuery = useOrders();
  const conversationsQuery = useQuery({
    queryKey: ['admin', 'company', companyId, 'conversations'],
    queryFn: async () => {
      const all = await getConversations();
      return all.filter((c) => c.companyId === companyId);
    },
  });

  const conversations = conversationsQuery.data ?? [];

  const companyOrders = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    return orders.filter((o) => o.companyId === companyId);
  }, [ordersQuery.data, companyId]);

  const completedOrders = companyOrders.filter((o) => o.status === OrderStatus.COMPLETED).length;
  const orderCompletionRate =
    companyOrders.length > 0 ? Math.round((completedOrders / companyOrders.length) * 100) : null;

  const isLoading = ordersQuery.isLoading || conversationsQuery.isLoading;

  if (isLoading) {
    return <p className="text-sm text-text-secondary">Loading tenant activity…</p>;
  }

  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-border-default bg-surface-base px-4 py-3 text-sm text-text-secondary">
        Operational snapshot for this tenant. Configure plans, users, agent settings, and billing in
        the{' '}
        <Link
          href={adminCompanyWorkspaceHref(companyId, 'manage')}
          scroll={false}
          className="font-medium text-text-brand underline hover:no-underline"
        >
          Manage
        </Link>{' '}
        tab.
      </p>

      <section className="rounded-lg border border-border-default bg-surface-base p-4">
        <h3 className="text-sm font-semibold text-text-primary">Activity</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Conversations"
            value={String(conversations.length)}
            href={adminCompanyWorkspaceHref(companyId, 'conversations')}
          />
          <StatCard
            label="Orders"
            value={String(companyOrders.length)}
            href={adminCompanyWorkspaceHref(companyId, 'orders')}
          />
          <div className="rounded-md border border-border-default bg-surface-raised p-3">
            <p className="text-xs text-text-secondary">Order completion rate</p>
            <p className="text-2xl font-semibold tabular-nums text-text-primary">
              {orderCompletionRate !== null ? `${orderCompletionRate}%` : '—'}
            </p>
            <p className="mt-1 text-xs text-text-secondary">Completed ÷ total orders</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border-default bg-surface-base p-4">
        <h3 className="text-sm font-semibold text-text-primary">Explore</h3>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          <TabLink companyId={companyId} tab="conversations" label="Conversations" />
          <TabLink companyId={companyId} tab="orders" label="Orders & payments" />
          <TabLink companyId={companyId} tab="agent" label="Agent performance" />
          <TabLink companyId={companyId} tab="appointments" label="Appointments" />
        </ul>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}): JSX.Element {
  return (
    <Link
      href={href}
      scroll={false}
      className="rounded-md border border-border-default bg-surface-raised p-3 transition-colors hover:border-border-brand hover:bg-surface-overlay"
    >
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
    </Link>
  );
}

function TabLink({
  companyId,
  tab,
  label,
}: {
  companyId: string;
  tab: string;
  label: string;
}): JSX.Element {
  return (
    <li>
      <Link
        href={adminCompanyWorkspaceHref(companyId, tab)}
        scroll={false}
        className="inline-flex rounded-md border border-border-default px-3 py-1.5 font-medium text-text-brand hover:bg-surface-raised"
      >
        {label}
      </Link>
    </li>
  );
}
