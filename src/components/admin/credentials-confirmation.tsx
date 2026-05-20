'use client';

import { CheckCircle, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ApiClientError } from '@/lib/api/client';
import { useSendOnboardingCredentials } from '@/lib/hooks/use-onboarding';
import { notify } from '@/lib/toast';
import type { AdminCreateUserResult } from '@/lib/types/admin-provisioning';

const PLATFORM_URL =
  typeof process.env.NEXT_PUBLIC_APP_URL === 'string' && process.env.NEXT_PUBLIC_APP_URL.length > 0
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'https://app.simplexlabs.co';

function CredentialRow({
  label,
  value,
  isPassword,
}: {
  label: string;
  value: string;
  isPassword?: boolean;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</span>
      <span
        className="break-all font-mono text-sm text-text-primary"
        {...(isPassword ? { 'aria-label': `${label} (hidden in logs)` } : {})}
      >
        {value}
      </span>
    </div>
  );
}

export interface CredentialsConfirmationProps {
  result: AdminCreateUserResult;
  /** Primary navigation after the admin is done sharing credentials. */
  doneHref?: string;
}

export function CredentialsConfirmation({ result, doneHref = '/admin/companies' }: CredentialsConfirmationProps): JSX.Element {
  const router = useRouter();
  const sendCredentials = useSendOnboardingCredentials();
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const credentialBlock = `Email: ${result.email}\nPassword: ${result.password}\nPlatform: ${PLATFORM_URL}`;

  const handleCopyAll = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(credentialBlock);
      setCopied(true);
      notify.success('All credentials copied');
    } catch {
      notify.error('Could not copy to clipboard');
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-light">
        <CheckCircle className="size-8 text-success" aria-hidden />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-text-primary">Account created</h2>
        <p className="mt-1 text-text-secondary">
          {result.firstName} {result.lastName} at {result.companyName}
        </p>
      </div>

      <div className="rounded-xl border-2 border-warning bg-warning-light p-6 text-left">
        <p className="mb-4 flex gap-2 text-sm font-semibold text-warning-dark">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          Share these credentials now — the password cannot be recovered after you leave this page
        </p>
        <div className="space-y-3">
          <CredentialRow label="Email" value={result.email} />
          <CredentialRow label="Password" value={result.password} isPassword />
          <CredentialRow label="Platform URL" value={PLATFORM_URL} />
        </div>
        <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => void handleCopyAll()}>
          {copied ? 'Copied' : 'Copy all credentials'}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={emailSent}
          onClick={async () => {
            try {
              await sendCredentials.mutateAsync({
                userId: result.userId,
                email: result.email,
                password: result.password,
                firstName: result.firstName,
                companyName: result.companyName,
              });
              setEmailSent(true);
              notify.success('Credentials email queued');
            } catch (err) {
              const message = err instanceof ApiClientError ? err.message : 'Could not send email';
              notify.error(message);
            }
          }}
        >
          {sendCredentials.isPending ? 'Sending…' : emailSent ? 'Email sent' : 'Send via email'}
        </Button>
        <Button type="button" className="flex-1" onClick={() => router.push(doneHref)}>
          Done
        </Button>
      </div>
    </div>
  );
}
