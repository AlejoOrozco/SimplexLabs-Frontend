'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
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
import { dateInputToIsoStart, isoToDateInput } from '@/lib/admin/subscription-form-datetime';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import { useAdminUpdateSubscription } from '@/lib/hooks/use-admin-company-subscriptions';
import {
  adminUpdateSubscriptionSchema,
  type AdminUpdateSubscriptionFormValues,
} from '@/lib/schemas/admin-hub/admin-subscription.schema';
import { notify } from '@/lib/toast';
import type { AdminCompanySubscription } from '@/lib/types/admin-hub';
import { SubStatus } from '@/lib/types';
import { subStatusLabel } from '@/lib/utils/format';

interface EditSubscriptionModalProps {
  companyId: string;
  subscription: AdminCompanySubscription;
  open: boolean;
  onClose: () => void;
}

export function EditSubscriptionModal({
  companyId,
  subscription,
  open,
  onClose,
}: EditSubscriptionModalProps): JSX.Element {
  const updateSubscription = useAdminUpdateSubscription(companyId);

  const form = useForm<AdminUpdateSubscriptionFormValues>({
    resolver: zodResolver(adminUpdateSubscriptionSchema),
    defaultValues: {
      status: subscription.status,
      billingCycle: subscription.billingCycle ?? 'MONTHLY',
      initialPayment: subscription.initialPayment ?? undefined,
      startedAt: subscription.startedAt,
      nextBillingAt: subscription.nextBillingAt ?? undefined,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      status: subscription.status,
      billingCycle: subscription.billingCycle ?? 'MONTHLY',
      initialPayment: subscription.initialPayment ?? undefined,
      startedAt: subscription.startedAt,
      nextBillingAt: subscription.nextBillingAt ?? undefined,
    });
  }, [open, subscription, form]);

  const onSubmit = async (values: AdminUpdateSubscriptionFormValues): Promise<void> => {
    try {
      await updateSubscription.mutateAsync({
        subscriptionId: subscription.id,
        dto: {
          status: values.status,
          billingCycle: values.billingCycle,
          initialPayment: values.initialPayment ?? null,
          startedAt: values.startedAt,
          nextBillingAt: values.nextBillingAt ?? null,
        },
      });
      notify.success('Subscription updated');
      onClose();
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not update subscription'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit subscription</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <p className="text-sm text-text-secondary">
            Plan: <span className="font-medium text-text-primary">{subscription.plan?.name ?? subscription.planId}</span>
          </p>

          <FormField label="Status" error={form.formState.errors.status?.message}>
            <Select
              value={form.watch('status') ?? subscription.status}
              onValueChange={(value: SubStatus) =>
                form.setValue('status', value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[SubStatus.ACTIVE, SubStatus.PAUSED, SubStatus.CANCELLED].map((status) => (
                  <SelectItem key={status} value={status}>
                    {subStatusLabel(status)}
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

          <FormField label="Start date" error={form.formState.errors.startedAt?.message}>
            <Input
              type="date"
              value={isoToDateInput(form.watch('startedAt'))}
              onChange={(e) =>
                form.setValue('startedAt', dateInputToIsoStart(e.target.value), {
                  shouldValidate: true,
                })
              }
            />
          </FormField>

          <FormField label="Next billing date" error={form.formState.errors.nextBillingAt?.message}>
            <Input
              type="date"
              value={isoToDateInput(form.watch('nextBillingAt'))}
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
            <Button type="button" variant="outline" onClick={onClose} disabled={updateSubscription.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateSubscription.isPending}>
              {updateSubscription.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
