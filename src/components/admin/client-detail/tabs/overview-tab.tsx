'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConversations } from '@/features/conversations/api/conversations.api';
import { isTenantTeamRole } from '@/lib/auth/session-role-utils';
import { useCompany } from '@/lib/hooks/use-companies';
import { useOrders } from '@/lib/hooks/use-orders';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { useUsers } from '@/lib/hooks/use-users';
import { OrderStatus } from '@/lib/types';
import { formatCurrency, formatDate, nicheLabel, subStatusLabel } from '@/lib/utils/format';

interface OverviewTabProps {
  companyId: string;
}

export function OverviewTab({ companyId }: OverviewTabProps): JSX.Element {
  const companyQuery = useCompany(companyId);
  const subscriptionsQuery = useSubscriptions();
  const usersQuery = useUsers();
  const ordersQuery = useOrders();
  const conversationsQuery = useQuery({
    queryKey: ['admin', 'company', companyId, 'conversations'],
    queryFn: async () => {
      const all = await getConversations();
      return all.filter((c) => c.companyId === companyId);
    },
  });

  const company = companyQuery.data;
  const conversations = conversationsQuery.data ?? [];

  const companySubscriptions = useMemo(() => {
    const subscriptions = subscriptionsQuery.data ?? [];
    return subscriptions.filter((s) => s.companyId === companyId);
  }, [subscriptionsQuery.data, companyId]);

  const primaryUser = useMemo(() => {
    const users = usersQuery.data ?? [];
    const tenantTeamUsers = users.filter(
      (u) => u.companyId === companyId && isTenantTeamRole(u.role) && u.isActive,
    );
    return tenantTeamUsers.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  }, [usersQuery.data, companyId]);

  const companyOrders = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    return orders.filter((o) => o.companyId === companyId);
  }, [ordersQuery.data, companyId]);

  const completedOrders = companyOrders.filter((o) => o.status === OrderStatus.COMPLETED).length;
  const agentSuccessRate =
    companyOrders.length > 0 ? Math.round((completedOrders / companyOrders.length) * 100) : null;

  if (companyQuery.isLoading) {
    return <p className="text-sm text-text-secondary">Loading company…</p>;
  }
  if (companyQuery.isError || !company) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
        Company could not be loaded.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border-default bg-surface-base p-4">
        <h3 className="text-sm font-semibold text-text-primary">Company</h3>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-secondary">Name</dt>
            <dd className="font-medium text-text-primary">{company.name}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Niche</dt>
            <dd className="font-medium text-text-primary">{nicheLabel(company.niche)}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Phone</dt>
            <dd className="text-text-primary">{company.phone ?? '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-text-secondary">Address</dt>
            <dd className="text-text-primary">{company.address ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-border-default bg-surface-base p-4">
        <h3 className="text-sm font-semibold text-text-primary">Plan & subscription</h3>
        {companySubscriptions.length === 0 ? (
          <p className="mt-2 text-sm text-text-secondary">No subscription on file.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {companySubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="rounded-md border border-border-default bg-surface-raised p-3"
              >
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-text-secondary">Plan</dt>
                    <dd className="font-medium text-text-primary">
                      {subscription.plan?.name ?? subscription.planId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Status</dt>
                    <dd className="text-text-primary">{subStatusLabel(subscription.status)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Started</dt>
                    <dd className="text-text-primary">{formatDate(subscription.startedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Next billing</dt>
                    <dd className="text-text-primary">
                      {subscription.nextBillingAt ? formatDate(subscription.nextBillingAt) : '—'}
                    </dd>
                  </div>
                  {subscription.plan ? (
                    <div>
                      <dt className="text-text-secondary">List price</dt>
                      <dd className="text-text-primary">{formatCurrency(subscription.plan.priceMonthly)} / mo</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border-default bg-surface-base p-4">
        <h3 className="text-sm font-semibold text-text-primary">Primary contact</h3>
        {primaryUser ? (
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-text-secondary">Name</dt>
              <dd className="font-medium text-text-primary">
                {primaryUser.firstName} {primaryUser.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Email</dt>
              <dd className="text-text-primary">{primaryUser.email}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-text-secondary">No active company user found for this tenant.</p>
        )}
      </section>

      <section className="rounded-lg border border-border-default bg-surface-base p-4">
        <h3 className="text-sm font-semibold text-text-primary">Quick stats</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border-default bg-surface-raised p-3">
            <p className="text-xs text-text-secondary">Conversations</p>
            <p className="text-2xl font-semibold tabular-nums">{conversations.length}</p>
          </div>
          <div className="rounded-md border border-border-default bg-surface-raised p-3">
            <p className="text-xs text-text-secondary">Orders</p>
            <p className="text-2xl font-semibold tabular-nums">{companyOrders.length}</p>
          </div>
          <div className="rounded-md border border-border-default bg-surface-raised p-3">
            <p className="text-xs text-text-secondary">Order completion rate</p>
            <p className="text-2xl font-semibold tabular-nums">
              {agentSuccessRate !== null ? `${agentSuccessRate}%` : '—'}
            </p>
            <p className="mt-1 text-xs text-text-secondary">Completed ÷ total orders</p>
          </div>
        </div>
      </section>
    </div>
  );
}
