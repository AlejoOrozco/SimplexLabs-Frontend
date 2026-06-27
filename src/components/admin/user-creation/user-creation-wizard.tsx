'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CredentialsConfirmation } from '@/components/admin/credentials-confirmation';
import { UserClientCompanyStep } from '@/components/admin/user-creation/user-client-company-step';
import { UserCredentialsStep } from '@/components/admin/user-creation/user-credentials-step';
import { UserReviewStep, userCredentialsStepValid } from '@/components/admin/user-creation/user-review-step';
import { UserStaffCompanyStep } from '@/components/admin/user-creation/user-staff-company-step';
import { UserStaffRoleStep } from '@/components/admin/user-creation/user-staff-role-step';
import { ApiClientError } from '@/lib/api/client';
import { buildAdminCreateUserVariables } from '@/lib/onboarding/build-admin-create-user-dto';
import { canSendOnboardingCredentialsEmail } from '@/lib/api/onboarding.api';
import { clearWizardLocalStorageDraft, useWizardLocalStorageDraft } from '@/lib/hooks/use-wizard-local-storage-draft';
import { useAdminCreateUser } from '@/lib/hooks/use-admin-user-creation';
import { useAdminCompanies } from '@/lib/hooks/use-admin-companies';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { notify } from '@/lib/toast';
import type { AdminCreateUserResult } from '@/lib/types/admin-provisioning';
import {
  USER_WIZARD_STORAGE_KEY,
  maxStepForUserWizard,
  mergeUserWizardDraftWithUrl,
  parseUserWizardUrl,
  reviveUserWizardState,
  serializeUserWizardState,
} from '@/lib/types/user-creation-wizard-state';
import type { UserWizardState } from '@/lib/types/user-creation-wizard-state';
import { cn } from '@/lib/utils/cn';

type UserScreen = 'company' | 'credentials' | 'role' | 'review';

function userWizardScreen(state: UserWizardState): UserScreen {
  if (state.step === 1) return 'company';
  if (state.step === 2) return 'credentials';
  if (state.userType === 'staff') {
    if (state.step === 3) return 'role';
    return 'review';
  }
  return state.step >= 3 ? 'review' : 'company';
}

function wizardStepNumberForScreen(screen: UserScreen, userType: UserWizardState['userType']): number {
  switch (screen) {
    case 'company':
      return 1;
    case 'credentials':
      return 2;
    case 'role':
      return 3;
    case 'review':
      return userType === 'staff' ? 4 : 3;
  }
}

function userWizardStepLabels(userType: UserWizardState['userType']): { number: number; label: string }[] {
  if (userType === 'client') {
    return [
      { number: 1, label: 'Company' },
      { number: 2, label: 'Credentials' },
      { number: 3, label: 'Review' },
    ];
  }
  return [
    { number: 1, label: 'Company' },
    { number: 2, label: 'Credentials' },
    { number: 3, label: 'Role' },
    { number: 4, label: 'Review' },
  ];
}

interface UserCreationWizardProps {
  searchParams: URLSearchParams;
}

export function UserCreationWizard({ searchParams }: UserCreationWizardProps): JSX.Element {
  const [state, setState] = useState<UserWizardState>(() => parseUserWizardUrl(searchParams));
  const [result, setResult] = useState<AdminCreateUserResult | null>(null);
  const createUser = useAdminCreateUser();
  const { data: companies = [] } = useAdminCompanies();
  const { data: subscriptions = [] } = useSubscriptions();

  const revive = useCallback((raw: unknown) => reviveUserWizardState(raw), []);
  const serialize = useCallback((s: UserWizardState) => serializeUserWizardState(s), []);
  const mergeHydrated = useCallback(
    (draft: UserWizardState) => mergeUserWizardDraftWithUrl(draft, searchParams),
    [searchParams],
  );

  useWizardLocalStorageDraft({
    storageKey: USER_WIZARD_STORAGE_KEY,
    state,
    setState,
    revive,
    serialize,
    mergeHydrated,
    disablePersist: Boolean(result),
  });

  useEffect(() => {
    setState((s) => {
      const max = maxStepForUserWizard(s.userType);
      if (s.step <= max) return s;
      return { ...s, step: max };
    });
  }, [state.userType, state.step]);

  useEffect(() => {
    if (!state.companyId || state.companyName) return;
    const name = companies.find((c) => c.id === state.companyId)?.name;
    if (name) setState((s) => ({ ...s, companyName: name }));
  }, [state.companyId, state.companyName, companies]);

  const screen = userWizardScreen(state);
  const currentStep = wizardStepNumberForScreen(screen, state.userType);
  const labels = userWizardStepLabels(state.userType);
  const maxStep = maxStepForUserWizard(state.userType);

  const selectedCompanyName = useMemo(
    () => state.companyName ?? companies.find((c) => c.id === state.companyId)?.name ?? '',
    [companies, state.companyId, state.companyName],
  );

  const canContinue = (): boolean => {
    if (screen === 'company') return Boolean(state.companyId);
    if (screen === 'credentials') return userCredentialsStepValid(state);
    if (screen === 'role') return true;
    return true;
  };

  const goNext = (): void => {
    setState((s) => ({ ...s, step: Math.min(maxStepForUserWizard(s.userType), s.step + 1) }));
  };

  const goBack = (): void => {
    setState((s) => (s.step <= 1 ? s : { ...s, step: s.step - 1 }));
  };

  const goToStep = (targetStep: number): void => {
    setState((s) => ({
      ...s,
      step: Math.min(Math.max(1, targetStep), maxStepForUserWizard(s.userType)),
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    const variables = buildAdminCreateUserVariables(state);
    if (!variables) {
      notify.error('Missing company');
      return;
    }
    try {
      const data = await createUser.mutateAsync(variables);
      setResult(data);
      clearWizardLocalStorageDraft(USER_WIZARD_STORAGE_KEY);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Could not create user';
      notify.error(message);
    }
  };

  if (result) {
    const emailRole = state.userType === 'client' ? 'COMPANY_ADMIN' : state.role;
    return (
      <CredentialsConfirmation
        result={result}
        doneHref="/admin/users"
        canSendEmail={canSendOnboardingCredentialsEmail(emailRole)}
      />
    );
  }

  const isClientFlow = state.userType === 'client';

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="User creation steps" className="flex flex-wrap gap-2">
        {labels.map((s) => {
          const isCurrent = s.number === currentStep;
          return (
            <button
              key={s.number}
              type="button"
              onClick={() => goToStep(s.number)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                isCurrent
                  ? 'border-border-focus bg-surface-raised text-text-brand shadow-brand'
                  : 'border-border-default bg-surface-base text-text-secondary hover:bg-surface-raised',
              )}
            >
              <span className="tabular-nums">{s.number}</span>
              <span className="ml-1.5 hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </nav>

      {isClientFlow ? (
        <p className="mt-4 text-sm text-text-secondary">
          Creating the company admin for a new company. To add staff to an existing company, use{' '}
          <span className="font-medium text-text-primary">New user</span> from the users list.
        </p>
      ) : null}

      <div className="mt-8">
        {screen === 'company' && isClientFlow ? (
          <UserClientCompanyStep
            companies={companies}
            selectedCompanyId={state.companyId}
            initialSearch={selectedCompanyName}
            onSelectCompany={(c) => setState((s) => ({ ...s, companyId: c.id, companyName: c.name }))}
          />
        ) : null}

        {screen === 'company' && !isClientFlow ? (
          <UserStaffCompanyStep
            companies={companies}
            subscriptions={subscriptions}
            selectedCompanyId={state.companyId}
            initialSearch={selectedCompanyName}
            onSelectCompany={(c) => setState((s) => ({ ...s, companyId: c.id, companyName: c.name }))}
          />
        ) : null}

        {screen === 'credentials' ? <UserCredentialsStep state={state} onUpdate={setState} /> : null}

        {screen === 'role' ? <UserStaffRoleStep state={state} onUpdate={setState} /> : null}

        {screen === 'review' ? (
          <UserReviewStep state={state} isSubmitting={createUser.isPending} onSubmit={() => void handleSubmit()} />
        ) : null}
      </div>

      {screen !== 'review' ? (
        <div className="mt-8 flex justify-between">
          <Button type="button" variant="ghost" onClick={goBack} disabled={state.step <= 1}>
            Back
          </Button>
          <Button type="button" onClick={goNext} disabled={!canContinue()}>
            {state.step >= maxStep ? 'Review' : 'Continue'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
