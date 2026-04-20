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
import { createContactSchema, type CreateContactDto } from '@/lib/schemas/contact.schema';
import { ContactSource } from '@/lib/types';
import { contactSourceLabel } from '@/lib/utils/format';

const SOURCES: readonly ContactSource[] = [
  ContactSource.MANUAL,
  ContactSource.WHATSAPP,
  ContactSource.INSTAGRAM,
  ContactSource.MESSENGER,
];

interface ContactFormProps {
  defaultValues?: Partial<CreateContactDto>;
  onSubmit: (values: CreateContactDto) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function ContactForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  onCancel,
}: ContactFormProps): JSX.Element {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateContactDto>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: null,
      phone: null,
      source: ContactSource.MANUAL,
      ...defaultValues,
    },
  });

  const submit = async (values: CreateContactDto): Promise<void> => {
    setApiError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setApiError(err instanceof ApiClientError ? err.message : 'Could not save contact');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" {...register('firstName')} />
          <FormError message={errors.firstName?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" {...register('lastName')} />
          <FormError message={errors.lastName?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        <FormError message={errors.email?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" {...register('phone')} />
        <FormError message={errors.phone?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="source">Source</Label>
        <Controller
          control={control}
          name="source"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {contactSourceLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormError message={errors.source?.message} />
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
