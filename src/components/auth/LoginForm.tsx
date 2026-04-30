'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/shared/FormError';
import { useAuth } from '@/context/auth-context';
import * as authApi from '@/lib/api/auth.api';
import { ApiClientError } from '@/lib/api/client';
import { loginSchema, type LoginDto } from '@/lib/schemas/auth.schema';
import { notify } from '@/lib/toast';

export function LoginForm(): JSX.Element {
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isOauthLoading, setIsOauthLoading] = useState<boolean>(false);

  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (values: LoginDto): Promise<void> => {
    setApiError(null);
    try {
      await notify.promise(login(values), {
        loading: 'Signing in...',
        success: 'Welcome back',
        error: (error) => (error instanceof Error ? error.message : 'Login failed'),
      });
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Login failed';
      setApiError(message);
    }
  };

  const handleGoogleOAuth = async (): Promise<void> => {
    setApiError(null);
    setIsOauthLoading(true);
    try {
      const { url } = await authApi.getGoogleOAuthUrl();
      notify.info('Redirecting to Google');
      window.location.href = url;
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Could not start Google sign-in';
      setApiError(message);
      setIsOauthLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
          autoComplete="current-password"
          aria-invalid={errors.password ? 'true' : 'false'}
          {...register('password')}
        />
        <FormError message={errors.password?.message} />
      </div>

      <FormError message={apiError} />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <Button
        type="button"
        variant="secondary"
        disabled={isOauthLoading}
        onClick={handleGoogleOAuth}
        className="w-full"
      >
        {isOauthLoading ? 'Redirecting…' : 'Continue with Google'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        No account?{' '}
        <Link href="/register" className="font-medium underline">
          Register
        </Link>
      </p>
    </form>
  );
}
