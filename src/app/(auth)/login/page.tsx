import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginPageError } from '@/app/(auth)/login/LoginPageError';

export default function LoginPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center p-6">
      <h1 className="mb-6 text-xl font-semibold">Sign in</h1>
      <Suspense fallback={null}>
        <LoginPageError />
      </Suspense>
      <LoginForm />
    </main>
  );
}
