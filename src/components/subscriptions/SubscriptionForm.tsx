'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormError } from '@/components/shared/FormError';
import { ApiClientError } from '@/lib/api/client';
import {
  createSubscriptionSchema,
  type CreateSubscriptionDto,
} from '@/lib/schemas/subscription.schema';
import { type Company, type Plan, SubStatus } from '@/lib/types';
import { formatCurrency, subStatusLabel } from '@/lib/utils/format';

const STATUSES: readonly SubStatus[] = [
  SubStatus.ACTIVE,
  SubStatus.PAUSED,
  SubStatus.CANCELLED,
];

interface SubscriptionFormProps {
  companies: readonly Company[];
  plans: readonly Plan[];
  defaultValues?: Partial<CreateSubscriptionDto>;
  onSubmit: (values: CreateSubscriptionDto) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function SubscriptionForm({
  companies,
  plans,
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  onCancel,
}: SubscriptionFormProps): JSX.Element {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSubscriptionDto>({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      companyId: '',
      planId: '',
      status: SubStatus.ACTIVE,
      initialPayment: null,
      startedAt: new Date().toISOString(),
      nextBillingAt: null,
      ...defaultValues,
    },
  });

  const submit = async (values: CreateSubscriptionDto): Promise<void> => {
    setApiError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setApiError(err instanceof ApiClientError ? err.message : 'Could not save subscription');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="companyId">Company</Label>
        <Controller
          control={control}
          name="companyId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="companyId">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormError message={errors.companyId?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="planId">Plan</Label>
        <Controller
          control={control}
          name="planId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="planId">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {formatCurrency(p.priceMonthly)}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormError message={errors.planId?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {subStatusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormError message={errors.status?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="initialPayment">Initial payment</Label>
        <Input
          id="initialPayment"
          type="number"
          step="0.01"
          min={0}
          {...register('initialPayment', {
            setValueAs: (v) => (v === '' ? null : Number(v)),
          })}
        />
        <FormError message={errors.initialPayment?.message} />
      </div>

      <FormError message={apiError} />

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
