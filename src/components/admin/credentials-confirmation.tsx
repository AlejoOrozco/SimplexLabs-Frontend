'use client';

import { CheckCircle, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage, isApiNotFoundError } from '@/lib/api/get-api-error-message';
import { useSendOnboardingCredentials } from '@/lib/hooks/use-onboarding';
import { notify } from '@/lib/toast';
import type { AdminCreateUserResult } from '@/lib/types/admin-provisioning';

const PLATFORM_URL =
  typeof process.env.NEXT_PUBLIC_APP_URL === 'string' && process.env.NEXT_PUBLIC_APP_URL.length > 0
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'https://app.simplexlabs.org';

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
  /** When set, called instead of navigating to `doneHref`. */
  onDone?: () => void;
  /** When false, hides email send (e.g. company staff role not supported by the endpoint). */
  canSendEmail?: boolean;
}

export function CredentialsConfirmation({
  result,
  doneHref = '/admin/companies',
  onDone,
  canSendEmail = true,
}: CredentialsConfirmationProps): JSX.Element {
  const router = useRouter();
  const sendCredentials = useSendOnboardingCredentials();
  const [emailSent, setEmailSent] = useState(false);
  const [emailSendFailed, setEmailSendFailed] = useState(false);
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
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-surface">
        <CheckCircle className="size-8 text-success" aria-hidden />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-text-primary">Account created</h2>
        <p className="mt-1 text-text-secondary">
          {result.firstName} {result.lastName} at {result.companyName}
        </p>
      </div>

      <div className="rounded-xl border-2 border-warning bg-warning-surface p-6 text-left">
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
        {canSendEmail ? (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={emailSent}
            onClick={async () => {
              try {
                const { sent } = await sendCredentials.mutateAsync({
                  userId: result.userId,
                  email: result.email,
                  password: result.password,
                  firstName: result.firstName,
                  companyName: result.companyName,
                });
                if (sent) {
                  setEmailSent(true);
                  setEmailSendFailed(false);
                  notify.success('Credentials email sent');
                  return;
                }
                setEmailSendFailed(true);
                notify.warning(
                  'Email could not be delivered. Copy the credentials below and share them manually.',
                );
              } catch (err) {
                if (isApiNotFoundError(err)) {
                  notify.error(
                    'Could not send email — user not found or this role cannot receive credential emails. Copy credentials manually.',
                  );
                  return;
                }
                notify.error(getApiErrorMessage(err, 'Could not send email'));
              }
            }}
          >
            {sendCredentials.isPending ? 'Sending…' : emailSent ? 'Email sent' : 'Send via email'}
          </Button>
        ) : null}
        <Button
          type="button"
          className="flex-1"
          onClick={() => {
            if (onDone) {
              onDone();
              return;
            }
            router.push(doneHref);
          }}
        >
          Done
        </Button>
      </div>
      {emailSendFailed ? (
        <p className="text-sm text-warning-dark">
          The user account was created, but the credentials email did not go through. Use copy above or try
          sending again.
        </p>
      ) : null}
    </div>
  );
}
