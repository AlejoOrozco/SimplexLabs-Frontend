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
import { createProductSchema, type CreateProductDto } from '@/lib/schemas/product.schema';
import { ProductType } from '@/lib/types';
import { productTypeLabel } from '@/lib/utils/format';

interface ProductFormProps {
  defaultValues?: Partial<CreateProductDto>;
  onSubmit: (values: CreateProductDto) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  onCancel,
}: ProductFormProps): JSX.Element {
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<CreateProductDto>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: null,
      type: ProductType.PRODUCT,
      price: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const submit = async (values: CreateProductDto): Promise<void> => {
    setApiError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setApiError(err instanceof ApiClientError ? err.message : 'Could not save product');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        <FormError message={errors.name?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[ProductType.PRODUCT, ProductType.SERVICE].map((t) => (
                    <SelectItem key={t} value={t}>
                      {productTypeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormError message={errors.type?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min={0}
            {...register('price', { valueAsNumber: true })}
          />
          <FormError message={errors.price?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} />
        <FormError message={errors.description?.message} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('isActive')} /> Active
      </label>

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
