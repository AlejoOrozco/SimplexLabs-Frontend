'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/shared/FormError';
import { ApiClientError } from '@/lib/api/client';
import { createWebsiteSchema, type CreateWebsiteDto } from '@/lib/schemas/website.schema';

interface WebsiteFormProps {
  defaultValues?: Partial<CreateWebsiteDto>;
  onSubmit: (values: CreateWebsiteDto) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function WebsiteForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  onCancel,
}: WebsiteFormProps): JSX.Element {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateWebsiteDto>({
    resolver: zodResolver(createWebsiteSchema),
    defaultValues: {
      url: '',
      label: null,
      isActive: true,
      ...defaultValues,
    },
  });

  const submit = async (values: CreateWebsiteDto): Promise<void> => {
    setApiError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setApiError(err instanceof ApiClientError ? err.message : 'Could not save website');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="url">URL</Label>
        <Input id="url" type="url" placeholder="https://example.com" {...register('url')} />
        <FormError message={errors.url?.message} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="label">Label</Label>
        <Input id="label" {...register('label')} />
        <FormError message={errors.label?.message} />
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
