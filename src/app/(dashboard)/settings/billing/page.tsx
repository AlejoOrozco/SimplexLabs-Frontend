'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { getClientSubscriptionBillingOverview } from '@/lib/api/subscription-billing.api';
import { getSubscriptions } from '@/lib/api/subscriptions.api';
import { SubStatus } from '@/lib/types';
import { formatCurrency, formatDate, subStatusLabel } from '@/lib/utils/format';

export default function BillingSettingsPage(): JSX.Element {
  const overviewQuery = useQuery({
    queryKey: ['subscriptions', 'billing-overview'],
    queryFn: getClientSubscriptionBillingOverview,
    retry: 1,
  });
  const subsFallback = useQuery({
    queryKey: ['subscriptions', 'list'],
    queryFn: getSubscriptions,
    enabled: overviewQuery.isError,
  });

  const overview = overviewQuery.data;
  const fallbackSubs = subsFallback.data ?? [];

  return (
    <section className="mx-auto max-w-3xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">Billing & subscriptions</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Plans by category, renewal dates, and invoice history for your company (scoped by your session).
        </p>
      </header>

      {overviewQuery.isLoading ? (
        <p className="text-sm text-text-secondary">Loading billing…</p>
      ) : overviewQuery.isError ? (
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <p className="text-sm text-text-secondary">
            Detailed billing overview is unavailable. Showing subscriptions list only.
          </p>
          {fallbackSubs.length === 0 ? (
            <p className="mt-2 text-sm text-text-secondary">No subscriptions loaded.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {fallbackSubs.map((s) => (
                <li key={s.id} className="rounded-md border border-border-default p-3 text-sm">
                  <span className="font-medium">{s.plan?.name ?? s.planId}</span>
                  <span className="ml-2 text-text-secondary">{subStatusLabel(s.status)}</span>
                  {s.nextBillingAt ? (
                    <span className="ml-2 text-xs text-text-secondary">Next: {formatDate(s.nextBillingAt)}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : overview ? (
        <>
          {overview.scheduledUpgrade ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
              <Badge variant="neutral">Scheduled upgrade</Badge>
              <span>
                {overview.scheduledUpgrade.planName} on {formatDate(overview.scheduledUpgrade.effectiveAt)}
              </span>
            </div>
          ) : null}

          <div>
            <h2 className="text-sm font-semibold text-text-primary">Active plans by category</h2>
            <ul className="mt-3 space-y-2">
              {overview.subscriptionsByCategory.length === 0 ? (
                <li className="text-sm text-text-secondary">No active categories returned.</li>
              ) : (
                overview.subscriptionsByCategory.map((row) => (
                  <li key={`${row.category}-${row.planName}`} className="rounded-md border border-border-default p-3">
                    <p className="text-sm font-medium text-text-primary">{String(row.category)}</p>
                    <p className="text-xs text-text-secondary">
                      {row.planName} · {subStatusLabel(row.status as SubStatus)}
                      {row.nextBillingAt ? ` · Next billing ${formatDate(row.nextBillingAt)}` : ''}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-text-primary">Billing history</h2>
            <ul className="mt-3 space-y-2">
              {overview.billingHistory.length === 0 ? (
                <li className="text-sm text-text-secondary">No invoices yet.</li>
              ) : (
                overview.billingHistory.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap justify-between gap-2 rounded-md border border-border-default p-3 text-sm"
                  >
                    <span className="text-text-secondary">{formatDate(row.createdAt)}</span>
                    <span className="font-medium tabular-nums">{formatCurrency(row.amountCents / 100)}</span>
                    <span className="w-full text-xs text-text-secondary">{row.status}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      ) : null}

      <p className="text-xs text-text-secondary">
        Need to change plans?{' '}
        <Link href="/settings/team" className="text-text-brand underline">
          Contact a company admin
        </Link>
        .
      </p>
    </section>
  );
}
