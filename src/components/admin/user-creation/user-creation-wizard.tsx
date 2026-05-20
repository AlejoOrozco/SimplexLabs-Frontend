'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CredentialsConfirmation } from '@/components/admin/credentials-confirmation';
import { UserClientCompanyStep } from '@/components/admin/user-creation/user-client-company-step';
import { UserCredentialsStep } from '@/components/admin/user-creation/user-credentials-step';
import { UserReviewStep, userCredentialsStepValid } from '@/components/admin/user-creation/user-review-step';
import { UserStaffCompanyStep } from '@/components/admin/user-creation/user-staff-company-step';
import { UserStaffRoleStep } from '@/components/admin/user-creation/user-staff-role-step';
import { UserCreationTypeStep } from '@/components/admin/user-creation/user-creation-type-step';
import { ApiClientError } from '@/lib/api/client';
import { buildAdminCreateUserVariables } from '@/lib/onboarding/build-admin-create-user-dto';
import { clearWizardLocalStorageDraft, useWizardLocalStorageDraft } from '@/lib/hooks/use-wizard-local-storage-draft';
import { useAdminCreateUser } from '@/lib/hooks/use-admin-user-creation';
import { useCompanies } from '@/lib/hooks/use-companies';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { notify } from '@/lib/toast';
import type { AdminCreateUserResult } from '@/lib/types/admin-provisioning';
import {
  USER_WIZARD_STORAGE_KEY,
  createInitialUserWizardState,
  maxStepForUserWizard,
  mergeUserWizardDraftWithUrl,
  parseUserWizardUrl,
  reviveUserWizardState,
  serializeUserWizardState,
} from '@/lib/types/user-creation-wizard-state';
import type { UserWizardState } from '@/lib/types/user-creation-wizard-state';
import { cn } from '@/lib/utils/cn';

type UserScreen = 'type' | 'company' | 'credentials' | 'role' | 'review';

function userWizardScreen(state: UserWizardState): UserScreen {
  if (!state.userType) return 'type';
  if (state.step === 2) return 'company';
  if (state.step === 3) return 'credentials';
  if (state.userType === 'staff' && state.step === 4) return 'role';
  return 'review';
}

function userWizardStepLabels(userType: UserWizardState['userType']): { number: number; label: string }[] {
  if (!userType) return [{ number: 1, label: 'Type' }];
  if (userType === 'client') {
    return [
      { number: 1, label: 'Type' },
      { number: 2, label: 'Company' },
      { number: 3, label: 'Credentials' },
      { number: 4, label: 'Review' },
    ];
  }
  return [
    { number: 1, label: 'Type' },
    { number: 2, label: 'Company' },
    { number: 3, label: 'Credentials' },
    { number: 4, label: 'Role' },
    { number: 5, label: 'Review' },
  ];
}

interface UserCreationWizardProps {
  searchParams: URLSearchParams;
}

export function UserCreationWizard({ searchParams }: UserCreationWizardProps): JSX.Element {
  const [state, setState] = useState<UserWizardState>(() => parseUserWizardUrl(searchParams));
  const [result, setResult] = useState<AdminCreateUserResult | null>(null);
  const createUser = useAdminCreateUser();
  const { data: companies = [] } = useCompanies();
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
      if (!s.userType) return s;
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
  const labels = userWizardStepLabels(state.userType);
  const maxStep = state.userType ? maxStepForUserWizard(state.userType) : 1;

  const selectedCompanyName = useMemo(
    () => state.companyName ?? companies.find((c) => c.id === state.companyId)?.name ?? '',
    [companies, state.companyId, state.companyName],
  );

  const canContinue = (): boolean => {
    if (screen === 'type') return state.userType !== null;
    if (screen === 'company') return Boolean(state.companyId);
    if (screen === 'credentials') return userCredentialsStepValid(state);
    if (screen === 'role') return true;
    return true;
  };

  const goNext = (): void => {
    setState((s) => {
      if (!s.userType) return s;
      const max = maxStepForUserWizard(s.userType);
      return { ...s, step: Math.min(max, s.step + 1) };
    });
  };

  const goBack = (): void => {
    setState((s) => {
      if (s.step <= 1) {
        return createInitialUserWizardState();
      }
      if (s.step === 2 && s.userType) {
        return { ...createInitialUserWizardState(), userType: null, step: 1 };
      }
      return { ...s, step: s.step - 1 };
    });
  };

  const handleSubmit = async (): Promise<void> => {
    const variables = buildAdminCreateUserVariables(state);
    if (!variables) {
      notify.error('Missing company or user type');
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
    return <CredentialsConfirmation result={result} doneHref="/admin/users" />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="User creation steps" className="flex flex-wrap gap-2">
        {labels.map((s) => {
          const isCurrent = s.number === state.step;
          return (
            <button
              key={s.number}
              type="button"
              onClick={() => setState((prev) => ({ ...prev, step: s.number }))}
              disabled={!state.userType && s.number > 1}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                isCurrent
                  ? 'border-brand-500 bg-brand-50 text-text-brand'
                  : 'border-border-default bg-surface-page text-text-secondary hover:bg-neutral-50',
                !state.userType && s.number > 1 && 'cursor-not-allowed opacity-50',
              )}
            >
              <span className="tabular-nums">{s.number}</span>
              <span className="ml-1.5 hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8">
        {screen === 'type' ? (
          <UserCreationTypeStep
            onSelect={(userType) =>
              setState((s) => ({
                ...s,
                userType,
                step: 2,
                companyId: null,
                companyName: null,
                permissionOverrides: [],
              }))
            }
          />
        ) : null}

        {screen === 'company' && state.userType === 'client' ? (
          <UserClientCompanyStep
            companies={companies}
            selectedCompanyId={state.companyId}
            initialSearch={selectedCompanyName}
            onSelectCompany={(c) => setState((s) => ({ ...s, companyId: c.id, companyName: c.name }))}
          />
        ) : null}

        {screen === 'company' && state.userType === 'staff' ? (
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
          <Button type="button" variant="ghost" onClick={goBack} disabled={screen === 'type'}>
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
