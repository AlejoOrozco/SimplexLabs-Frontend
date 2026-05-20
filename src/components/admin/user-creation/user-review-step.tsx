'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { buildAdminCreateUserVariables } from '@/lib/onboarding/build-admin-create-user-dto';
import { useCompanies } from '@/lib/hooks/use-companies';
import type { UserWizardState } from '@/lib/types/user-creation-wizard-state';
import { sessionRoleLabel } from '@/lib/utils/format';
import { z } from 'zod';

interface UserReviewStepProps {
  state: UserWizardState;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function UserReviewStep({ state, isSubmitting, onSubmit }: UserReviewStepProps): JSX.Element {
  const { data: companies = [] } = useCompanies();
  const companyName =
    state.companyName ?? companies.find((c) => c.id === state.companyId)?.name ?? '—';

  const variables = useMemo(() => buildAdminCreateUserVariables(state), [state]);

  const permissionSummary = useMemo(() => {
    if (state.userType !== 'staff' || state.role !== 'COMPANY_STAFF') return [];
    return state.permissionOverrides.filter((o) => o.isGranted).map((o) => o.permissionKey).slice(0, 8);
  }, [state.userType, state.permissionOverrides, state.role]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border-default bg-surface-raised p-4">
        <h3 className="text-sm font-semibold text-text-primary">Company</h3>
        <p className="mt-2 text-sm text-text-secondary">{companyName}</p>
      </section>

      <section className="rounded-lg border border-border-default bg-surface-raised p-4">
        <h3 className="text-sm font-semibold text-text-primary">User</h3>
        <dl className="mt-2 space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-text-secondary">Name</dt>
            <dd className="text-right font-medium">
              {state.credentials.firstName} {state.credentials.lastName}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-text-secondary">Email</dt>
            <dd className="break-all text-right font-medium">{state.credentials.email}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-text-secondary">Role</dt>
            <dd className="text-right font-medium">
              {state.userType === 'client' ? sessionRoleLabel('COMPANY_ADMIN') : sessionRoleLabel(state.role)}
            </dd>
          </div>
        </dl>
      </section>

      {permissionSummary.length > 0 ? (
        <section className="rounded-lg border border-border-default bg-surface-raised p-4">
          <h3 className="text-sm font-semibold text-text-primary">Key permissions enabled</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-text-secondary">
            {permissionSummary.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <Button type="button" className="w-full" disabled={isSubmitting || !variables} onClick={() => void onSubmit()}>
        {isSubmitting ? 'Creating…' : 'Create account'}
      </Button>
    </div>
  );
}

const NAME_MIN = 2;
const NAME_MAX = 80;

export function userCredentialsStepValid(state: UserWizardState): boolean {
  const emailOk = z.string().email().safeParse(state.credentials.email.trim()).success;
  const first = state.credentials.firstName.trim();
  const last = state.credentials.lastName.trim();
  const nameOk =
    first.length >= NAME_MIN &&
    first.length <= NAME_MAX &&
    last.length >= NAME_MIN &&
    last.length <= NAME_MAX;
  return nameOk && emailOk;
}
