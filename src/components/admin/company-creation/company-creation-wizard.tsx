'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CompanyAgentStepSection, CompanyWhatsappStepSection } from '@/components/admin/company-creation/company-creation-agent-whatsapp';
import { CompanyInfoStepSection, CompanyPlansStepSection } from '@/components/admin/company-creation/company-creation-info-plans';
import { CompanyReviewStepSection } from '@/components/admin/company-creation/company-creation-review';
import { StepWebsites } from '@/components/admin/company-creation/step-websites';
import { ApiClientError } from '@/lib/api/client';
import { adminCreateCompanyWebsite } from '@/lib/api/admin-websites.api';
import { buildAdminCreateCompanyDto } from '@/lib/onboarding/build-admin-create-company-dto';
import {
  companyCreationPhysicalStepCount,
  companyCreationStepLabels,
  getCompanyCreationScreen,
  goNextCompanyCreationStep,
  goPrevCompanyCreationStep,
} from '@/lib/onboarding/company-creation-wizard-navigation';
import { defaultChannelsForAiAgentsPlan } from '@/lib/onboarding/plan-channel-config';
import { clearWizardLocalStorageDraft, useWizardLocalStorageDraft } from '@/lib/hooks/use-wizard-local-storage-draft';
import { useAdminCreateCompanyWithSetup } from '@/lib/hooks/use-admin-company-creation';
import { usePlans } from '@/lib/hooks/use-plans';
import { notify } from '@/lib/toast';
import type { AdminCreateCompanyResult } from '@/lib/types/admin-provisioning';
import {
  COMPANY_WIZARD_STORAGE_KEY,
  createInitialCompanyWizardState,
  getAgentsPlanId,
  reviveCompanyWizardState,
  serializeCompanyWizardState,
} from '@/lib/types/company-creation-wizard-state';
import type { CompanyWizardState } from '@/lib/types/company-creation-wizard-state';
import { PaymentMethod as PaymentMethodEnum } from '@/lib/types/onboarding';
import { cn } from '@/lib/utils/cn';

function appendCompanyIdParam(returnTo: string, companyId: string): string {
  const joiner = returnTo.includes('?') ? '&' : '?';
  return `${returnTo}${joiner}companyId=${encodeURIComponent(companyId)}`;
}

interface CompanyCreationWizardProps {
  returnTo?: string | null;
}

export function CompanyCreationWizard({ returnTo }: CompanyCreationWizardProps): JSX.Element {
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const createCompany = useAdminCreateCompanyWithSetup();
  const [state, setState] = useState<CompanyWizardState>(() => createInitialCompanyWizardState());
  const [success, setSuccess] = useState<AdminCreateCompanyResult | null>(null);

  const revive = useCallback((raw: unknown) => reviveCompanyWizardState(raw), []);
  const serialize = useCallback((s: CompanyWizardState) => serializeCompanyWizardState(s), []);

  useWizardLocalStorageDraft({
    storageKey: COMPANY_WIZARD_STORAGE_KEY,
    state,
    setState,
    revive,
    serialize,
    disablePersist: Boolean(success),
  });

  const screen = getCompanyCreationScreen(state);
  const maxStep = companyCreationPhysicalStepCount(state);
  const stepLabels = companyCreationStepLabels(state);

  const agentsPlanId = getAgentsPlanId(state);
  const prevAgentsPlanId = useRef<string | undefined>(undefined);
  const selectionKey = JSON.stringify(state.plans);

  useEffect(() => {
    if (!agentsPlanId) {
      prevAgentsPlanId.current = undefined;
      return;
    }
    if (agentsPlanId === prevAgentsPlanId.current) return;
    prevAgentsPlanId.current = agentsPlanId;
    const plan = plans.find((p) => p.id === agentsPlanId);
    const defaults = defaultChannelsForAiAgentsPlan(plan ?? null);
    setState((s) => {
      if (!s.agentConfig) return s;
      return {
        ...s,
        agentConfig: {
          ...s.agentConfig,
          channels: defaults,
          paymentMethods:
            s.agentConfig.paymentMethods.length > 0 ? s.agentConfig.paymentMethods : [PaymentMethodEnum.CARD, PaymentMethodEnum.BANK_TRANSFER],
        },
      };
    });
  }, [agentsPlanId, plans]);

  useEffect(() => {
    setState((s) => {
      const max = companyCreationPhysicalStepCount(s);
      if (s.step <= max) return s;
      return { ...s, step: max as CompanyWizardState['step'] };
    });
  }, [selectionKey]);

  const canContinue = (): boolean => {
    if (screen === 'info') return state.info.name.trim().length > 0;
    if (screen === 'plans') return true;
    if (screen === 'agent') {
      const a = state.agentConfig;
      if (!a) return false;
      return (
        a.name.trim().length > 0 &&
        a.fallbackMessage.trim().length > 0 &&
        a.escalationMessage.trim().length > 0 &&
        a.channels.length > 0 &&
        a.paymentMethods.length > 0
      );
    }
    if (screen === 'whatsapp') {
      if (state.whatsapp.skip) return true;
      return state.whatsapp.phoneNumberId.trim().length > 0 && state.whatsapp.phoneNumber.trim().length > 0;
    }
    if (screen === 'websites') return true;
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      const dto = buildAdminCreateCompanyDto(state);
      const res = await createCompany.mutateAsync(dto);
      const drafts = (state.websites ?? []).filter((w) => w.url.trim().length > 0);
      let hadWebsiteFailure = false;
      for (const website of drafts) {
        try {
          await adminCreateCompanyWebsite(res.companyId, {
            url: website.url.trim(),
            label: website.label.trim() === '' ? null : website.label.trim(),
            isActive: website.isActive,
          });
        } catch {
          hadWebsiteFailure = true;
        }
      }
      setSuccess(res);
      clearWizardLocalStorageDraft(COMPANY_WIZARD_STORAGE_KEY);
      if (hadWebsiteFailure) {
        notify.warning(
          'Company created but one website URL could not be saved. Add it from the company detail panel.',
        );
      } else {
        notify.success('Company created');
      }
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Could not create company';
      notify.error(message);
    }
  };

  if (success) {
    const userWizardHref = appendCompanyIdParam('/admin/onboarding?step=2&mode=client', success.companyId);
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h2 className="text-2xl font-semibold text-text-primary">Company created</h2>
        <p className="text-sm text-text-secondary">{success.companyName}</p>
        {success.activatedPlanNames.length > 0 ? (
          <div className="rounded-lg border border-border-default bg-surface-raised p-4 text-left text-sm">
            <p className="font-medium text-text-primary">Plans activated</p>
            <ul className="mt-2 list-inside list-disc text-text-secondary">
              {success.activatedPlanNames.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">No plans were activated in this setup.</p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" asChild className="sm:flex-1">
            <Link href={userWizardHref}>Now create a user for this company</Link>
          </Button>
          <Button type="button" variant="outline" asChild className="sm:flex-1">
            <Link href="/admin/companies">Done</Link>
          </Button>
        </div>
        {returnTo ? (
          <Button type="button" variant="ghost" asChild className="w-full">
            <Link href={appendCompanyIdParam(returnTo, success.companyId)}>Return to previous flow</Link>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="Company creation steps" className="flex flex-wrap gap-2">
        {stepLabels.map((s) => {
          const isCurrent = s.number === state.step;
          return (
            <button
              key={s.number}
              type="button"
              onClick={() =>
                setState((prev) => ({ ...prev, step: s.number as CompanyWizardState['step'] }))
              }
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                isCurrent
                  ? 'border-brand-500 bg-brand-50 text-text-brand'
                  : 'border-border-default bg-surface-page text-text-secondary hover:bg-neutral-50',
              )}
            >
              <span className="tabular-nums">{s.number}</span>
              <span className="ml-1.5 hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8">
        {screen === 'info' ? (
          <CompanyInfoStepSection state={state} plans={plans} plansLoading={plansLoading} onUpdate={setState} />
        ) : null}
        {screen === 'plans' ? (
          <CompanyPlansStepSection state={state} plans={plans} plansLoading={plansLoading} onUpdate={setState} />
        ) : null}
        {screen === 'agent' ? (
          <CompanyAgentStepSection state={state} plans={plans} onUpdate={setState} />
        ) : null}
        {screen === 'whatsapp' ? <CompanyWhatsappStepSection state={state} onUpdate={setState} /> : null}
        {screen === 'websites' ? <StepWebsites state={state} onUpdate={setState} /> : null}
        {screen === 'review' ? (
          <CompanyReviewStepSection
            state={state}
            plans={plans}
            isSubmitting={createCompany.isPending}
            onSubmit={() => void handleSubmit()}
          />
        ) : null}
      </div>

      {screen !== 'review' ? (
        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setState((s) => goPrevCompanyCreationStep(s))}
            disabled={state.step === 1}
          >
            Back
          </Button>
          <Button type="button" onClick={() => setState((s) => goNextCompanyCreationStep(s))} disabled={!canContinue()}>
            {state.step >= maxStep ? 'Review' : 'Continue'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
