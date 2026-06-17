'use client';

import { Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  AUTH_DEACTIVATED_EVENT,
  type AuthDeactivatedDetail,
  type AuthDeactivationKind,
} from '@/lib/auth/account-deactivation';

const DEFAULT_SUPPORT_CONTACT =
  process.env.NEXT_PUBLIC_SUPPORT_CONTACT ?? 'Contact your administrator or Simplex support.';

export interface AccountDeactivatedModalProps {
  isOpen: boolean;
  kind?: AuthDeactivationKind;
  contact?: string;
  /** Extra body copy from the API, shown under the title when present. */
  message?: string;
}

export function AccountDeactivatedModal({
  isOpen,
  kind = 'account',
  contact,
  message,
}: AccountDeactivatedModalProps): JSX.Element {
  const displayContact = contact?.trim() ? contact : DEFAULT_SUPPORT_CONTACT;
  const isCompany = kind === 'company';

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="border-border-default bg-surface-base text-center sm:rounded-lg"
        closable={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-surface">
          <Lock className="h-8 w-8 text-error" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          {isCompany ? 'Company deactivated' : 'Account deactivated'}
        </h2>
        <p className="mt-2 text-text-secondary">
          {isCompany
            ? 'Your organization has been deactivated. You cannot access the platform until an administrator reactivates your company.'
            : 'Your account has been temporarily deactivated. This may be due to a billing issue or a policy violation.'}
        </p>
        {message ? <p className="mt-2 text-sm text-text-secondary">{message}</p> : null}
        <div className="mt-4 rounded-lg border border-border-default bg-surface-raised p-3">
          <p className="text-sm text-text-secondary">Contact us to resolve this:</p>
          <p className="mt-1 text-sm font-medium text-text-brand">{displayContact}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full border-border-default"
          onClick={() => {
            try {
              localStorage.clear();
            } catch {
              /* ignore quota / private mode */
            }
            window.location.assign('/login');
          }}
        >
          Return to login
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/** Subscribes to `account-deactivated` and renders {@link AccountDeactivatedModal}. */
export function AccountDeactivatedModalRoot(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<AuthDeactivatedDetail | null>(null);

  useEffect(() => {
    const onDeactivated = (event: Event): void => {
      const custom = event as CustomEvent<AuthDeactivatedDetail>;
      setDetail(custom.detail ?? null);
      setOpen(true);
    };
    window.addEventListener(AUTH_DEACTIVATED_EVENT, onDeactivated);
    return () => window.removeEventListener(AUTH_DEACTIVATED_EVENT, onDeactivated);
  }, []);

  return (
    <AccountDeactivatedModal
      isOpen={open}
      kind={detail?.kind}
      contact={detail?.contact}
      message={detail?.message}
    />
  );
}
