'use client';

import { useMemo, useState } from 'react';
import { AssignSubscriptionModal } from '@/components/admin/manage/company/assign-subscription-modal';
import { EditSubscriptionModal } from '@/components/admin/manage/company/edit-subscription-modal';
import { SwapSubscriptionModal } from '@/components/admin/manage/company/swap-subscription-modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/shared/Skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminPlanCategoryLabel, subscriptionMatchesCategory } from '@/lib/admin/admin-hub-utils';
import { getApiErrorMessage, isApiConflictError } from '@/lib/api/get-api-error-message';
import { useCompany } from '@/lib/hooks/use-companies';
import {
  useAdminCancelSubscription,
  useAdminCompanySubscriptions,
  useAdminReactivateSubscription,
} from '@/lib/hooks/use-admin-company-subscriptions';
import { AdminPlanCategory } from '@/lib/types/admin-hub';
import type { AdminCompanySubscription } from '@/lib/types/admin-hub';
import { SubStatus } from '@/lib/types';
import { formatCurrency, formatDate, subStatusLabel } from '@/lib/utils/format';
import { notify } from '@/lib/toast';

const PLAN_CATEGORIES = [
  AdminPlanCategory.WEBSITE,
  AdminPlanCategory.MARKETING,
  AdminPlanCategory.AI_AGENTS,
] as const;

interface ManageSubscriptionsSectionProps {
  companyId: string;
  companyIsInactive?: boolean;
}

function subscriptionStatusBadgeVariant(
  status: SubStatus,
): 'success' | 'warning' | 'neutral' {
  if (status === SubStatus.ACTIVE) return 'success';
  if (status === SubStatus.PAUSED) return 'warning';
  return 'neutral';
}

function pickPrimarySubscription(
  subscriptions: AdminCompanySubscription[],
): AdminCompanySubscription | undefined {
  return subscriptions.find(
    (s) => s.status === SubStatus.ACTIVE || s.status === SubStatus.PAUSED,
  );
}

export function ManageSubscriptionsSection({
  companyId,
  companyIsInactive = false,
}: ManageSubscriptionsSectionProps): JSX.Element {
  const companyQuery = useCompany(companyId);
  const subscriptionsQuery = useAdminCompanySubscriptions(companyId);
  const cancelSubscription = useAdminCancelSubscription(companyId);
  const reactivateSubscription = useAdminReactivateSubscription(companyId);

  const [assignCategory, setAssignCategory] = useState<AdminPlanCategory | null>(null);
  const [swapSubscription, setSwapSubscription] = useState<AdminCompanySubscription | null>(null);
  const [editSubscription, setEditSubscription] = useState<AdminCompanySubscription | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AdminCompanySubscription | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const companyNiche = companyQuery.data?.niche;

  const subscriptionsByCategory = useMemo(() => {
    const rows = subscriptionsQuery.data ?? [];
    const map = new Map<AdminPlanCategory, AdminCompanySubscription[]>();
    for (const category of PLAN_CATEGORIES) {
      map.set(
        category,
        rows.filter((s) => subscriptionMatchesCategory(s, category)),
      );
    }
    return map;
  }, [subscriptionsQuery.data]);

  if (subscriptionsQuery.isLoading || companyQuery.isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (subscriptionsQuery.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
        Could not load subscriptions for this company.
      </div>
    );
  }

  if (!companyNiche) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
        Company niche is unavailable. Cannot load plan picker.
      </div>
    );
  }

  const handleCancel = async (): Promise<void> => {
    if (!cancelTarget) return;
    try {
      await cancelSubscription.mutateAsync({
        subscriptionId: cancelTarget.id,
        dto: cancelReason.trim() ? { reason: cancelReason.trim() } : {},
      });
      notify.success('Subscription cancelled');
      setCancelTarget(null);
      setCancelReason('');
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not cancel subscription'));
    }
  };

  const handleReactivate = async (subscription: AdminCompanySubscription): Promise<void> => {
    try {
      await reactivateSubscription.mutateAsync(subscription.id);
      notify.success('Subscription reactivated');
    } catch (error) {
      if (isApiConflictError(error)) {
        notify.error(
          'Another active subscription already exists in this category. Cancel or replace it first.',
        );
        return;
      }
      notify.error(getApiErrorMessage(error, 'Could not reactivate subscription'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-text-primary">Plans &amp; subscriptions</h3>
        <p className="mt-1 text-sm text-text-secondary">
          One active or paused plan per category (Website, Marketing, AI Agents). Assigning a duplicate
          prompts a one-click replace.
        </p>
      </div>

      <div className="space-y-4">
        {PLAN_CATEGORIES.map((category) => {
          const categorySubs = subscriptionsByCategory.get(category) ?? [];
          const primary = pickPrimarySubscription(categorySubs);
          const cancelled = categorySubs.filter((s) => s.status === SubStatus.CANCELLED);

          return (
            <section
              key={category}
              className="rounded-lg border border-border-default bg-surface-base p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">
                    {adminPlanCategoryLabel(category)}
                  </h4>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {primary ? 'Active subscription on file' : 'No active subscription'}
                  </p>
                </div>
                {!primary && !companyIsInactive ? (
                  <Button type="button" size="sm" onClick={() => setAssignCategory(category)}>
                    Assign plan
                  </Button>
                ) : null}
              </div>

              {primary ? (
                <SubscriptionRow
                  subscription={primary}
                  companyIsInactive={companyIsInactive}
                  onEdit={() => setEditSubscription(primary)}
                  onSwap={() => setSwapSubscription(primary)}
                  onCancel={() => {
                    setCancelTarget(primary);
                    setCancelReason('');
                  }}
                />
              ) : (
                <p className="mt-3 text-sm text-text-secondary">No active or paused plan assigned.</p>
              )}

              {cancelled.length > 0 ? (
                <div className="mt-4 space-y-2 border-t border-border-default pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Cancelled history
                  </p>
                  {cancelled.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium text-text-primary">
                          {sub.plan?.name ?? sub.planId}
                        </span>
                        <span className="ml-2 text-xs text-text-secondary">
                          Cancelled · started {formatDate(sub.startedAt)}
                        </span>
                      </div>
                      {!companyIsInactive ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={reactivateSubscription.isPending}
                          onClick={() => void handleReactivate(sub)}
                        >
                          Reactivate
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {assignCategory ? (
        <AssignSubscriptionModal
          companyId={companyId}
          companyNiche={companyNiche}
          category={assignCategory}
          open
          onClose={() => setAssignCategory(null)}
        />
      ) : null}

      {swapSubscription ? (
        <SwapSubscriptionModal
          companyId={companyId}
          companyNiche={companyNiche}
          subscription={swapSubscription}
          open
          onClose={() => setSwapSubscription(null)}
        />
      ) : null}

      {editSubscription ? (
        <EditSubscriptionModal
          companyId={companyId}
          subscription={editSubscription}
          open
          onClose={() => setEditSubscription(null)}
        />
      ) : null}

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelReason('');
          }
        }}
        title="Cancel subscription?"
        description={
          cancelTarget?.plan?.name
            ? `Cancel "${cancelTarget.plan.name}" for this company?`
            : 'Cancel this subscription for the company?'
        }
        confirmLabel="Cancel subscription"
        variant="destructive"
        onConfirm={handleCancel}
        isLoading={cancelSubscription.isPending}
      >
        <div className="space-y-2 py-2">
          <Label htmlFor="cancel-reason">Reason (optional)</Label>
          <Input
            id="cancel-reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Why is this subscription being cancelled?"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}

interface SubscriptionRowProps {
  subscription: AdminCompanySubscription;
  companyIsInactive: boolean;
  onEdit: () => void;
  onSwap: () => void;
  onCancel: () => void;
}

function SubscriptionRow({
  subscription,
  companyIsInactive,
  onEdit,
  onSwap,
  onCancel,
}: SubscriptionRowProps): JSX.Element {
  return (
    <div className="mt-3 rounded-md border border-border-default bg-surface-raised p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-text-primary">
              {subscription.plan?.name ?? subscription.planId}
            </span>
            <Badge variant={subscriptionStatusBadgeVariant(subscription.status)}>
              {subStatusLabel(subscription.status)}
            </Badge>
          </div>
          <dl className="mt-2 grid gap-1 text-xs text-text-secondary sm:grid-cols-2">
            <div>
              <dt className="inline">Billing: </dt>
              <dd className="inline font-medium text-text-primary">
                {subscription.billingCycle === 'ANNUAL' ? 'Annual' : 'Monthly'}
              </dd>
            </div>
            <div>
              <dt className="inline">Initial payment: </dt>
              <dd className="inline font-medium text-text-primary">
                {subscription.initialPayment != null
                  ? formatCurrency(subscription.initialPayment)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="inline">Started: </dt>
              <dd className="inline font-medium text-text-primary">
                {formatDate(subscription.startedAt)}
              </dd>
            </div>
            <div>
              <dt className="inline">Next billing: </dt>
              <dd className="inline font-medium text-text-primary">
                {subscription.nextBillingAt ? formatDate(subscription.nextBillingAt) : '—'}
              </dd>
            </div>
          </dl>
          {subscription.billingRecords && subscription.billingRecords.length > 0 ? (
            <p className="mt-2 text-xs text-text-secondary">
              {subscription.billingRecords.length} billing record
              {subscription.billingRecords.length === 1 ? '' : 's'} on file
            </p>
          ) : null}
        </div>

        {!companyIsInactive ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onSwap}>
              Swap plan
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
