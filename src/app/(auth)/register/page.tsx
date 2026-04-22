'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

export default function RegisterPage(): JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(endpoints.auth.register.path, {
        method: 'POST',
        body: { firstName, lastName, email, password },
      });
      router.push('/dashboard');
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : 'Registration failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center p-6">
      <h1 className="mb-6 text-xl font-semibold">Create account</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input className="w-full rounded border px-3 py-2" onChange={(event) => setFirstName(event.target.value)} placeholder="First name" required value={firstName} />
        <input className="w-full rounded border px-3 py-2" onChange={(event) => setLastName(event.target.value)} placeholder="Last name" required value={lastName} />
        <input className="w-full rounded border px-3 py-2" onChange={(event) => setEmail(event.target.value)} placeholder="Email" required type="email" value={email} />
        <input className="w-full rounded border px-3 py-2" onChange={(event) => setPassword(event.target.value)} placeholder="Password" required type="password" value={password} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-black px-3 py-2 text-white" disabled={submitting} type="submit">
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </main>
  );
}
