'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  dateInputToIsoStart,
  defaultInitialPaymentForPlan,
  defaultSubscriptionStartedDateInput,
} from '@/lib/admin/subscription-form-datetime';
import { adminPlanCategoryLabel, subscriptionPlanCategory } from '@/lib/admin/admin-hub-utils';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import { useAdminSwapSubscriptionPlan } from '@/lib/hooks/use-admin-company-subscriptions';
import { useAdminPlans } from '@/lib/hooks/use-admin-plans';
import {
  adminSwapSubscriptionPlanSchema,
  type AdminSwapSubscriptionPlanFormValues,
} from '@/lib/schemas/admin-hub/admin-subscription.schema';
import { notify } from '@/lib/toast';
import type { AdminCompanySubscription } from '@/lib/types/admin-hub';
import type { Niche } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';

interface SwapSubscriptionModalProps {
  companyId: string;
  companyNiche: Niche;
  subscription: AdminCompanySubscription;
  open: boolean;
  onClose: () => void;
}

export function SwapSubscriptionModal({
  companyId,
  companyNiche,
  subscription,
  open,
  onClose,
}: SwapSubscriptionModalProps): JSX.Element {
  const category = subscriptionPlanCategory(subscription);
  const swapPlan = useAdminSwapSubscriptionPlan(companyId);
  const plansQuery = useAdminPlans(
    category ? { niche: companyNiche, category, activeOnly: true } : {},
    open && Boolean(category),
  );

  const form = useForm<AdminSwapSubscriptionPlanFormValues>({
    resolver: zodResolver(adminSwapSubscriptionPlanSchema),
    defaultValues: {
      planId: subscription.planId,
      billingCycle: subscription.billingCycle ?? 'MONTHLY',
      initialPayment: subscription.initialPayment ?? undefined,
      effectiveAt: dateInputToIsoStart(defaultSubscriptionStartedDateInput()),
    },
  });

  const selectedPlanId = form.watch('planId');
  const selectedPlan = useMemo(
    () => plansQuery.data?.find((plan) => plan.id === selectedPlanId),
    [plansQuery.data, selectedPlanId],
  );

  useEffect(() => {
    if (!open) return;
    form.reset({
      planId: subscription.planId,
      billingCycle: subscription.billingCycle ?? 'MONTHLY',
      initialPayment: subscription.initialPayment ?? undefined,
      effectiveAt: dateInputToIsoStart(defaultSubscriptionStartedDateInput()),
    });
  }, [open, subscription, form]);

  useEffect(() => {
    if (!selectedPlan) return;
    if (selectedPlan.id === subscription.planId) return;
    form.setValue('initialPayment', defaultInitialPaymentForPlan(selectedPlan));
  }, [selectedPlan, subscription.planId, form]);

  const onSubmit = async (values: AdminSwapSubscriptionPlanFormValues): Promise<void> => {
    try {
      await swapPlan.mutateAsync({
        subscriptionId: subscription.id,
        dto: {
          planId: values.planId,
          billingCycle: values.billingCycle,
          initialPayment: values.initialPayment ?? null,
          effectiveAt: values.effectiveAt,
        },
      });
      notify.success('Plan swapped', {
        description: 'The subscription was replaced with the new plan.',
      });
      onClose();
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not swap plan'));
    }
  };

  const effectiveDateValue = form.watch('effectiveAt')?.slice(0, 10) ?? defaultSubscriptionStartedDateInput();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Swap {category ? adminPlanCategoryLabel(category) : ''} plan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <p className="text-sm text-text-secondary">
            Current: <span className="font-medium text-text-primary">{subscription.plan?.name ?? 'Unknown'}</span>
          </p>

          <FormField label="New plan" required error={form.formState.errors.planId?.message}>
            <Select
              value={selectedPlanId || undefined}
              onValueChange={(value) => form.setValue('planId', value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {(plansQuery.data ?? []).map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} · {formatCurrency(plan.priceMonthly)}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Billing cycle" error={form.formState.errors.billingCycle?.message}>
            <Select
              value={form.watch('billingCycle') ?? 'MONTHLY'}
              onValueChange={(value: 'MONTHLY' | 'ANNUAL') =>
                form.setValue('billingCycle', value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="ANNUAL">Annual</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Effective date" error={form.formState.errors.effectiveAt?.message}>
            <Input
              type="date"
              value={effectiveDateValue}
              onChange={(e) =>
                form.setValue('effectiveAt', dateInputToIsoStart(e.target.value), {
                  shouldValidate: true,
                })
              }
            />
          </FormField>

          <FormField label="Initial payment" error={form.formState.errors.initialPayment?.message}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.watch('initialPayment') ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                form.setValue(
                  'initialPayment',
                  raw === '' ? undefined : Number(raw),
                  { shouldValidate: true },
                );
              }}
            />
          </FormField>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={swapPlan.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={swapPlan.isPending || !selectedPlanId}>
              {swapPlan.isPending ? 'Swapping…' : 'Swap plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
