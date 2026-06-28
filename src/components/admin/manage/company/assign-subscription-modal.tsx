'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/shared/FormField';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
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
import { adminPlanCategoryLabel } from '@/lib/admin/admin-hub-utils';
import { getApiErrorMessage, isApiConflictError } from '@/lib/api/get-api-error-message';
import { useAdminAssignSubscription } from '@/lib/hooks/use-admin-company-subscriptions';
import { useAdminPlans } from '@/lib/hooks/use-admin-plans';
import { adminAssignSubscriptionSchema, type AdminAssignSubscriptionFormValues } from '@/lib/schemas/admin-hub/admin-subscription.schema';
import { notify } from '@/lib/toast';
import type { AdminAssignSubscriptionDto, AdminPlanCategory } from '@/lib/types/admin-hub';
import type { Niche } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';

interface AssignSubscriptionModalProps {
  companyId: string;
  companyNiche: Niche;
  category: AdminPlanCategory;
  open: boolean;
  onClose: () => void;
}

export function AssignSubscriptionModal({
  companyId,
  companyNiche,
  category,
  open,
  onClose,
}: AssignSubscriptionModalProps): JSX.Element {
  const assignSubscription = useAdminAssignSubscription(companyId);
  const plansQuery = useAdminPlans(
    { niche: companyNiche, category, activeOnly: true },
    open,
  );
  const [replacePromptOpen, setReplacePromptOpen] = useState(false);
  const [pendingDto, setPendingDto] = useState<AdminAssignSubscriptionDto | null>(null);

  const form = useForm<AdminAssignSubscriptionFormValues>({
    resolver: zodResolver(adminAssignSubscriptionSchema),
    defaultValues: {
      planId: '',
      billingCycle: 'MONTHLY',
      startedAt: dateInputToIsoStart(defaultSubscriptionStartedDateInput()),
      initialPayment: undefined,
      nextBillingAt: undefined,
      replaceExisting: false,
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
      planId: '',
      billingCycle: 'MONTHLY',
      startedAt: dateInputToIsoStart(defaultSubscriptionStartedDateInput()),
      initialPayment: undefined,
      nextBillingAt: undefined,
      replaceExisting: false,
    });
    setReplacePromptOpen(false);
    setPendingDto(null);
  }, [open, category, form]);

  useEffect(() => {
    if (!selectedPlan) return;
    form.setValue('initialPayment', defaultInitialPaymentForPlan(selectedPlan));
  }, [selectedPlan, form]);

  const submitAssign = async (dto: AdminAssignSubscriptionDto): Promise<void> => {
    try {
      await assignSubscription.mutateAsync(dto);
      notify.success('Subscription assigned', {
        description: `${adminPlanCategoryLabel(category)} plan is now linked to this company.`,
      });
      onClose();
    } catch (error) {
      if (isApiConflictError(error) && !dto.replaceExisting) {
        setPendingDto(dto);
        setReplacePromptOpen(true);
        return;
      }
      notify.error(getApiErrorMessage(error, 'Could not assign subscription'));
    }
  };

  const onSubmit = async (values: AdminAssignSubscriptionFormValues): Promise<void> => {
    const dto: AdminAssignSubscriptionDto = {
      planId: values.planId,
      billingCycle: values.billingCycle,
      startedAt: values.startedAt,
      initialPayment: values.initialPayment ?? null,
      nextBillingAt: values.nextBillingAt ?? null,
      replaceExisting: values.replaceExisting ?? false,
    };
    await submitAssign(dto);
  };

  const handleConfirmReplace = async (): Promise<void> => {
    if (!pendingDto) return;
    await submitAssign({ ...pendingDto, replaceExisting: true });
    setReplacePromptOpen(false);
    setPendingDto(null);
  };

  const startedDateValue = form.watch('startedAt').slice(0, 10);
  const nextBillingDateValue = form.watch('nextBillingAt')?.slice(0, 10) ?? '';

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign {adminPlanCategoryLabel(category)} plan</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="Plan" required error={form.formState.errors.planId?.message}>
              {plansQuery.isLoading ? (
                <p className="text-sm text-text-secondary">Loading plans…</p>
              ) : (plansQuery.data?.length ?? 0) === 0 ? (
                <p className="text-sm text-text-secondary">
                  No active plans for this niche and category.
                </p>
              ) : (
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
              )}
            </FormField>

            <FormField label="Billing cycle" required error={form.formState.errors.billingCycle?.message}>
              <Select
                value={form.watch('billingCycle')}
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

            <FormField label="Start date" required error={form.formState.errors.startedAt?.message}>
              <Input
                type="date"
                value={startedDateValue}
                onChange={(e) =>
                  form.setValue('startedAt', dateInputToIsoStart(e.target.value), {
                    shouldValidate: true,
                  })
                }
              />
            </FormField>

            <FormField
              label="Next billing date"
              error={form.formState.errors.nextBillingAt?.message}
              description="Optional — backend defaults to one billing period after start"
            >
              <Input
                type="date"
                value={nextBillingDateValue}
                onChange={(e) => {
                  const value = e.target.value;
                  form.setValue(
                    'nextBillingAt',
                    value ? dateInputToIsoStart(value) : undefined,
                    { shouldValidate: true },
                  );
                }}
              />
            </FormField>

            <FormField
              label="Initial payment"
              error={form.formState.errors.initialPayment?.message}
              description="Defaults to setup fee or monthly price"
            >
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
              <Button type="button" variant="outline" onClick={onClose} disabled={assignSubscription.isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={assignSubscription.isPending || !selectedPlanId || (plansQuery.data?.length ?? 0) === 0}
              >
                {assignSubscription.isPending ? 'Assigning…' : 'Assign plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={replacePromptOpen}
        onOpenChange={setReplacePromptOpen}
        title="Replace existing plan?"
        description={`This company already has an active ${adminPlanCategoryLabel(category).toLowerCase()} subscription. Replace it with the selected plan?`}
        confirmLabel="Replace plan"
        onConfirm={handleConfirmReplace}
        isLoading={assignSubscription.isPending}
      />
    </>
  );
}
