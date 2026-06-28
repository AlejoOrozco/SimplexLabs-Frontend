'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormField } from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { Textarea } from '@/components/ui/textarea';
import { adminPlanCategoryLabel } from '@/lib/admin/admin-hub-utils';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import { useAdminRecordManualPayment } from '@/lib/hooks/use-admin-company-billing';
import {
  defaultRecordPaymentDatetimeLocal,
  recordManualPaymentUiSchema,
  recordManualPaymentUiToDto,
  type RecordManualPaymentUiFormValues,
} from '@/lib/schemas/admin-hub/admin-record-payment.schema';
import type { AdminBillingSubscriptionLine } from '@/lib/types/admin-hub';
import { SubStatus } from '@/lib/types';
import { subStatusLabel } from '@/lib/utils/format';
import { notify } from '@/lib/toast';

const PAYMENT_METHODS = [
  { value: 'WIRE_TRANSFER', label: 'Wire transfer' },
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'OTHER', label: 'Other' },
] as const;

function subscriptionOptionLabel(subscription: AdminBillingSubscriptionLine): string {
  const category = subscription.category
    ? adminPlanCategoryLabel(subscription.category)
    : 'Plan';
  return `${category} · ${subscription.planName} (${subStatusLabel(subscription.status)})`;
}

interface RecordManualPaymentModalProps {
  companyId: string;
  open: boolean;
  onClose: () => void;
  subscriptions: readonly AdminBillingSubscriptionLine[];
  defaultSubscriptionId?: string;
}

export function RecordManualPaymentModal({
  companyId,
  open,
  onClose,
  subscriptions,
  defaultSubscriptionId,
}: RecordManualPaymentModalProps): JSX.Element {
  const recordPayment = useAdminRecordManualPayment(companyId);

  const form = useForm<RecordManualPaymentUiFormValues>({
    resolver: zodResolver(recordManualPaymentUiSchema),
    defaultValues: {
      subscriptionId: '',
      paidAtLocal: defaultRecordPaymentDatetimeLocal(),
      paymentMethod: 'WIRE_TRANSFER',
      amount: '',
      billingRecordId: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    const preferredId =
      defaultSubscriptionId ??
      subscriptions.find((s) => s.status === SubStatus.ACTIVE)?.id ??
      subscriptions[0]?.id ??
      '';
    form.reset({
      subscriptionId: preferredId,
      paidAtLocal: defaultRecordPaymentDatetimeLocal(),
      paymentMethod: 'WIRE_TRANSFER',
      amount: '',
      billingRecordId: '',
      notes: '',
    });
  }, [open, defaultSubscriptionId, subscriptions, form]);

  const onSubmit = async (values: RecordManualPaymentUiFormValues): Promise<void> => {
    const { subscriptionId, dto } = recordManualPaymentUiToDto(values);
    try {
      await recordPayment.mutateAsync({ subscriptionId, dto });
      notify.success('Manual payment recorded');
      onClose();
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not record payment'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record manual payment</DialogTitle>
        </DialogHeader>

        {subscriptions.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Assign a subscription before recording a payment.
          </p>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField
              label="Subscription"
              required
              error={form.formState.errors.subscriptionId?.message}
            >
              <Controller
                control={form.control}
                name="subscriptionId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptions.map((subscription) => (
                        <SelectItem key={subscription.id} value={subscription.id}>
                          {subscriptionOptionLabel(subscription)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              label="Paid at"
              required
              error={form.formState.errors.paidAtLocal?.message}
            >
              <Input {...form.register('paidAtLocal')} type="datetime-local" />
            </FormField>

            <FormField
              label="Payment method"
              required
              error={form.formState.errors.paymentMethod?.message}
            >
              <Controller
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Amount" error={form.formState.errors.amount?.message}>
              <Input
                {...form.register('amount')}
                type="number"
                min={0}
                step="0.01"
                placeholder="Optional — defaults to subscription charge"
              />
            </FormField>

            <FormField
              label="Billing record ID"
              error={form.formState.errors.billingRecordId?.message}
              description="Optional — link to an existing unpaid billing record"
            >
              <Input {...form.register('billingRecordId')} autoComplete="off" />
            </FormField>

            <FormField label="Notes" error={form.formState.errors.notes?.message}>
              <Textarea {...form.register('notes')} rows={2} placeholder="Optional internal note" />
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={recordPayment.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? 'Saving…' : 'Record payment'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
