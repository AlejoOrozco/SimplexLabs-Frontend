'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { isAuthDeactivationError } from '@/lib/auth/is-auth-deactivation-error';

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  /** Stays true after a successful sign-in until `window.location.assign` unloads the page. */
  const [signInCommitPending, setSignInCommitPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (signInCommitPending) return;
    setSignInCommitPending(true);
    setError(null);
    try {
      await login({ email, password });
    } catch (unknownError) {
      setSignInCommitPending(false);
      if (isAuthDeactivationError(unknownError)) return;
      const message = unknownError instanceof Error ? unknownError.message : 'Login failed';
      setError(message);
    }
  }

  const fieldClass =
    'w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus/50';

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center p-6">
      <div className="mb-4 flex justify-center px-2">
        <Image
          src="/login-logo.png"
          alt="Simplex Labs"
          width={560}
          height={112}
          className="h-auto w-full object-contain"
          priority
        />
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm text-text-secondary" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className={fieldClass}
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <label className="block text-sm text-text-secondary" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className={fieldClass}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <button
          className="w-full rounded-md border border-transparent bg-gradient-brand px-3 py-2 text-sm font-medium text-text-inverse shadow-brand transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={signInCommitPending}
          type="submit"
        >
          {signInCommitPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
