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
import { createCompanySchema, type CreateCompanyDto } from '@/lib/schemas/company.schema';
import { Niche } from '@/lib/types';
import { nicheLabel } from '@/lib/utils/format';

const NICHES: readonly Niche[] = [Niche.GYM, Niche.MEDICAL, Niche.ENTREPRENEUR];

interface CompanyFormProps {
  defaultValues?: Partial<CreateCompanyDto>;
  onSubmit: (values: CreateCompanyDto) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function CompanyForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  onCancel,
}: CompanyFormProps): JSX.Element {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCompanyDto>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      niche: Niche.GYM,
      phone: null,
      address: null,
      ...defaultValues,
    },
  });

  const submit = async (values: CreateCompanyDto): Promise<void> => {
    setApiError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setApiError(err instanceof ApiClientError ? err.message : 'Could not save company');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        <FormError message={errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="niche">Niche</Label>
        <Controller
          control={control}
          name="niche"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="niche">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {nicheLabel(n)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormError message={errors.niche?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" {...register('phone')} />
        <FormError message={errors.phone?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" {...register('address')} />
        <FormError message={errors.address?.message} />
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
