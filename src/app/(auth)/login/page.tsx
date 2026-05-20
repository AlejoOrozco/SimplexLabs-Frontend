'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { ApiClientError } from '@/lib/api/client';

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading: authSessionLoading } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
    } catch (unknownError) {
      if (unknownError instanceof ApiClientError && unknownError.code === 'ACCOUNT_DEACTIVATED') return;
      const message = unknownError instanceof Error ? unknownError.message : 'Login failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center p-6">
      <h1 className="mb-6 text-xl font-semibold">Sign in</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="w-full rounded border px-3 py-2"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <label className="block text-sm" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="w-full rounded border px-3 py-2"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          className="w-full rounded bg-black px-3 py-2 text-white"
          disabled={submitting || authSessionLoading}
          type="submit"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
