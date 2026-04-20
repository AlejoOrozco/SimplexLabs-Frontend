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
import { createUserSchema, type CreateUserDto } from '@/lib/schemas/user.schema';
import { Role, type Company } from '@/lib/types';
import { roleLabel } from '@/lib/utils/format';

interface UserFormProps {
  companies: readonly Company[];
  defaultValues?: Partial<CreateUserDto>;
  onSubmit: (values: CreateUserDto) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function UserForm({
  companies,
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  onCancel,
}: UserFormProps): JSX.Element {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserDto>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: Role.CLIENT,
      companyId: null,
      isActive: true,
      ...defaultValues,
    },
  });

  const submit = async (values: CreateUserDto): Promise<void> => {
    setApiError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setApiError(err instanceof ApiClientError ? err.message : 'Could not save user');
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
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password')} />
        <FormError message={errors.password?.message} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role">Role</Label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[Role.SUPER_ADMIN, Role.CLIENT].map((r) => (
                  <SelectItem key={r} value={r}>
                    {roleLabel(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormError message={errors.role?.message} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="companyId">Company</Label>
        <Controller
          control={control}
          name="companyId"
          render={({ field }) => (
            <Select
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v === '' ? null : v)}
            >
              <SelectTrigger id="companyId">
                <SelectValue placeholder="No company (admin)" />
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
