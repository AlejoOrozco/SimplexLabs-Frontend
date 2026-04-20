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
import { Textarea } from '@/components/ui/textarea';
import { FormError } from '@/components/shared/FormError';
import { ApiClientError } from '@/lib/api/client';
import { createOrderSchema, type CreateOrderDto } from '@/lib/schemas/order.schema';
import type { ClientContact, Product } from '@/lib/types';
import { formatCurrency, fullName } from '@/lib/utils/format';

interface OrderFormProps {
  contacts: readonly ClientContact[];
  products: readonly Product[];
  defaultValues?: Partial<CreateOrderDto>;
  onSubmit: (values: CreateOrderDto) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function OrderForm({
  contacts,
  products,
  defaultValues,
  onSubmit,
  submitLabel = 'Create order',
  onCancel,
}: OrderFormProps): JSX.Element {
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<CreateOrderDto>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      contactId: defaultValues?.contactId ?? '',
      productId: defaultValues?.productId ?? '',
      amount: defaultValues?.amount ?? 0,
      notes: defaultValues?.notes ?? null,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const submit = async (values: CreateOrderDto): Promise<void> => {
    setApiError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setApiError(err instanceof ApiClientError ? err.message : 'Could not save order');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="contactId">Contact</Label>
        <Controller
          control={control}
          name="contactId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="contactId">
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {fullName(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormError message={errors.contactId?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="productId">Product</Label>
        <Controller
          control={control}
          name="productId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="productId">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {formatCurrency(p.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormError message={errors.productId?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min={0}
          {...register('amount', { valueAsNumber: true })}
        />
        <FormError message={errors.amount?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} />
        <FormError message={errors.notes?.message} />
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
