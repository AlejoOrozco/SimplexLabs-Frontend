'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RecordManualPaymentModal } from '@/components/admin/manage/company/record-manual-payment-modal';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminPlanCategoryLabel } from '@/lib/admin/admin-hub-utils';
import { adminCompanyManageSectionHref } from '@/lib/admin/admin-company-workspace-href';
import { useAdminCompanyBillingOverview } from '@/lib/hooks/use-admin-company-billing';
import type { AdminBillingRecordSummary, AdminBillingSubscriptionLine } from '@/lib/types/admin-hub';
import { SubStatus } from '@/lib/types';
import { formatCurrency, formatDate, subStatusLabel } from '@/lib/utils/format';

function subscriptionStatusBadgeVariant(
  status: SubStatus,
): 'success' | 'warning' | 'neutral' {
  if (status === SubStatus.ACTIVE) return 'success';
  if (status === SubStatus.PAUSED) return 'warning';
  return 'neutral';
}

function parseBillingAmount(amount: string): number {
  const parsed = Number.parseFloat(amount);
  return Number.isFinite(parsed) ? parsed : 0;
}

interface ManageBillingSectionProps {
  companyId: string;
  companyIsInactive?: boolean;
}

export function ManageBillingSection({
  companyId,
  companyIsInactive = false,
}: ManageBillingSectionProps): JSX.Element {
  const billingQuery = useAdminCompanyBillingOverview(companyId);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  if (billingQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full max-w-xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (billingQuery.isError || !billingQuery.data) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
        Could not load billing overview for this company.
      </div>
    );
  }

  const overview = billingQuery.data;
  const subscriptions = overview.subscriptions;
  const recentPayments = overview.recentPayments;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Billing</h3>
          <p className="mt-1 text-sm text-text-secondary">
            MRR snapshot, upcoming charges, and recent payments for this tenant. Plan changes are
            managed under{' '}
            <Link
              href={adminCompanyManageSectionHref(companyId, 'subscriptions')}
              scroll={false}
              className="font-medium text-text-brand underline hover:no-underline"
            >
              Subscriptions
            </Link>
            .
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setRecordPaymentOpen(true)}
          disabled={companyIsInactive || subscriptions.length === 0}
        >
          Record payment
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BillingStatCard
          label="Monthly recurring revenue"
          value={formatCurrency(overview.mrr)}
        />
        <BillingStatCard
          label="Next charge"
          value={overview.nextChargeAt ? formatDate(overview.nextChargeAt) : '—'}
          hint={
            overview.nextChargeAt
              ? 'Earliest upcoming subscription charge'
              : 'No upcoming charge scheduled'
          }
        />
      </div>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-text-primary">Subscription charges</h4>
        {subscriptions.length === 0 ? (
          <EmptyState
            title="No subscription billing lines"
            description="Assign a plan to see recurring charges for this company."
            action={
              <Button type="button" variant="outline" asChild>
                <Link href={adminCompanyManageSectionHref(companyId, 'subscriptions')} scroll={false}>
                  Go to Subscriptions
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {subscriptions.map((subscription) => (
              <SubscriptionChargeRow key={subscription.id} subscription={subscription} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-text-primary">Recent payments</h4>
        {recentPayments.length === 0 ? (
          <p className="rounded-lg border border-border-default bg-surface-base px-4 py-3 text-sm text-text-secondary">
            No payments recorded yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {recentPayments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </ul>
        )}
      </section>

      <RecordManualPaymentModal
        companyId={companyId}
        open={recordPaymentOpen}
        onClose={() => setRecordPaymentOpen(false)}
        subscriptions={subscriptions}
      />
    </div>
  );
}

function BillingStatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-border-default bg-surface-base p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-secondary">{hint}</p> : null}
    </div>
  );
}

function SubscriptionChargeRow({
  subscription,
}: {
  subscription: AdminBillingSubscriptionLine;
}): JSX.Element {
  return (
    <li className="rounded-lg border border-border-default bg-surface-base p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-text-primary">{subscription.planName}</span>
            <Badge variant={subscriptionStatusBadgeVariant(subscription.status)}>
              {subStatusLabel(subscription.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {subscription.category ? adminPlanCategoryLabel(subscription.category) : 'Uncategorized'}{' '}
            · {subscription.billingCycle === 'ANNUAL' ? 'Annual' : 'Monthly'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold tabular-nums text-text-primary">
            {formatCurrency(subscription.amount)}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Next: {subscription.nextBillingAt ? formatDate(subscription.nextBillingAt) : '—'}
          </p>
        </div>
      </div>
    </li>
  );
}

function PaymentRow({ payment }: { payment: AdminBillingRecordSummary }): JSX.Element {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-default bg-surface-base px-4 py-3 text-sm">
      <div>
        <p className="font-medium text-text-primary">{formatDate(payment.paidAt)}</p>
        <p className="text-xs text-text-secondary">
          {payment.isSetupFee ? 'Setup fee' : 'Subscription payment'}
        </p>
      </div>
      <p className="font-semibold tabular-nums text-text-primary">
        {formatCurrency(parseBillingAmount(payment.amount))}
      </p>
    </li>
  );
}
