'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CredentialsConfirmation } from '@/components/admin/credentials-confirmation';
import type { OnboardingStepProps } from '@/components/admin/onboarding/onboarding-step-props';
import { ApiClientError } from '@/lib/api/client';
import { buildCompleteOnboardingDto } from '@/lib/onboarding/build-complete-onboarding-dto';
import { paymentMethodLabel } from '@/lib/onboarding/payment-method-label';
import { useAdminCompanies } from '@/lib/hooks/use-admin-companies';
import { useCompleteOnboarding } from '@/lib/hooks/use-onboarding';
import { usePlans } from '@/lib/hooks/use-plans';
import { notify } from '@/lib/toast';
import type { OnboardingResult } from '@/lib/types/onboarding';
import { channelLabel, nicheLabel } from '@/lib/utils/format';

function ReviewSection({ title, rows }: { title: string; rows: { label: string; value: string }[] }): JSX.Element {
  return (
    <section className="rounded-lg border border-border-default bg-surface-raised p-4">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap gap-x-2 gap-y-1">
            <dt className="text-text-secondary">{row.label}</dt>
            <dd className="min-w-0 flex-1 text-right font-medium text-text-primary">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function StepReview({ state }: OnboardingStepProps): JSX.Element {
  const [result, setResult] = useState<OnboardingResult | null>(null);
  const completeOnboarding = useCompleteOnboarding();
  const { data: companies = [] } = useAdminCompanies();
  const { data: plans = [] } = usePlans();

  const companyRows = useMemo(() => {
    if (state.company.mode === 'existing') {
      const name =
        companies.find((c) => c.id === state.company.existingCompanyId)?.name ?? '— (not selected)';
      return [{ label: 'Company', value: name }];
    }
    return [
      { label: 'Name', value: state.company.name || '—' },
      { label: 'Niche', value: state.company.niche ? nicheLabel(state.company.niche) : '—' },
      { label: 'Phone', value: state.company.phone || '—' },
      { label: 'Address', value: state.company.address || '—' },
    ];
  }, [companies, state.company]);

  const selectedPlan = plans.find((p) => p.id === state.plan.planId);
  const planName = selectedPlan?.name ?? (state.plan.planId ? state.plan.planId : '—');

  const userRows = [
    { label: 'Email', value: state.credentials.email || '—' },
    { label: 'Name', value: `${state.credentials.firstName} ${state.credentials.lastName}`.trim() || '—' },
  ];

  const planRows = [
    { label: 'Plan', value: planName },
    { label: 'Initial payment', value: String(state.plan.initialPayment) },
    { label: 'Started', value: state.plan.startedAt },
    { label: 'Next billing', value: state.plan.nextBillingAt ?? '—' },
  ];

  const agentRows = [
    { label: 'Agent', value: state.agent.agentName || '—' },
    { label: 'Channels', value: state.agent.channels.map(channelLabel).join(', ') || '—' },
    {
      label: 'Payment methods',
      value: state.agent.paymentMethods.map(paymentMethodLabel).join(', ') || '—',
    },
  ];

  const handleConfirm = async (): Promise<void> => {
    try {
      const data = await completeOnboarding.mutateAsync(buildCompleteOnboardingDto(state));
      setResult(data);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Onboarding failed';
      notify.error(message);
    }
  };

  if (result) {
    return <CredentialsConfirmation result={result} doneHref="/admin/companies" />;
  }

  return (
    <div className="space-y-6">
      <ReviewSection title="Company" rows={companyRows} />
      <ReviewSection title="User" rows={userRows} />
      <ReviewSection title="Plan" rows={planRows} />
      <ReviewSection title="Agent" rows={agentRows} />

      <Button
        type="button"
        className="w-full"
        disabled={completeOnboarding.isPending}
        onClick={() => void handleConfirm()}
      >
        {completeOnboarding.isPending ? 'Creating…' : 'Create company account'}
      </Button>

      <p className="text-center text-xs text-text-secondary">
        Use the step tabs at the top to jump back and edit any section before you confirm.
      </p>
    </div>
  );
}
