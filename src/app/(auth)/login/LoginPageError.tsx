'use client';

import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  oauth_failed: 'Google sign-in failed. Please try again.',
};

export function LoginPageError(): JSX.Element | null {
  const params = useSearchParams();
  const code = params.get('error');
  if (!code) return null;
  const message = ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.';
  return (
    <div
      role="alert"
      className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
    >
      {message}
    </div>
  );
}
