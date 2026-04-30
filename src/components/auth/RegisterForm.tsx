'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { useAuth } from '@/context/auth-context';
import { ApiClientError } from '@/lib/api/client';
import { registerSchema, type RegisterDto } from '@/lib/schemas/auth.schema';
import { notify } from '@/lib/toast';
import { Niche } from '@/lib/types';
import { nicheLabel } from '@/lib/utils/format';

const NICHE_OPTIONS: readonly Niche[] = [Niche.GYM, Niche.MEDICAL, Niche.ENTREPRENEUR];

export function RegisterForm(): JSX.Element {
  const { register: registerUser } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      companyName: '',
      niche: Niche.GYM,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (values: RegisterDto): Promise<void> => {
    setApiError(null);
    try {
      await notify.promise(registerUser(values), {
        loading: 'Creating account...',
        success: 'Account created',
        error: (error) => (error instanceof Error ? error.message : 'Registration failed'),
      });
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Registration failed';
      setApiError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            aria-invalid={errors.firstName ? 'true' : 'false'}
            {...register('firstName')}
          />
          <FormError message={errors.firstName?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            aria-invalid={errors.lastName ? 'true' : 'false'}
            {...register('lastName')}
          />
          <FormError message={errors.lastName?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? 'true' : 'false'}
          {...register('email')}
        />
        <FormError message={errors.email?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.password ? 'true' : 'false'}
          {...register('password')}
        />
        <FormError message={errors.password?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="companyName">Company name</Label>
        <Input
          id="companyName"
          autoComplete="organization"
          aria-invalid={errors.companyName ? 'true' : 'false'}
          {...register('companyName')}
        />
        <FormError message={errors.companyName?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="niche">Niche</Label>
        <Controller
          control={control}
          name="niche"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="niche">
                <SelectValue placeholder="Select a niche" />
              </SelectTrigger>
              <SelectContent>
                {NICHE_OPTIONS.map((n) => (
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

      <FormError message={apiError} />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
