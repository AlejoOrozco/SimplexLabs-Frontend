'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import type { CompanyPickerOption } from '@/components/admin/user-creation/user-client-company-step';
import type { Subscription } from '@/lib/types';
import { SubStatus } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

const RETURN_TO = encodeURIComponent('/admin/onboarding');

interface UserStaffCompanyStepProps {
  companies: readonly CompanyPickerOption[];
  subscriptions: readonly Subscription[];
  selectedCompanyId: string | null;
  initialSearch: string;
  onSelectCompany: (company: CompanyPickerOption) => void;
}

function activePlanCountForCompany(subs: readonly Subscription[], companyId: string): number {
  return subs.filter((s) => s.companyId === companyId && s.status === SubStatus.ACTIVE).length;
}

export function UserStaffCompanyStep({
  companies,
  subscriptions,
  selectedCompanyId,
  initialSearch,
  onSelectCompany,
}: UserStaffCompanyStepProps): JSX.Element {
  const [query, setQuery] = useState(initialSearch);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q.length === 0 ? companies : companies.filter((c) => c.name.toLowerCase().includes(q));
    return base.slice(0, 16);
  }, [companies, query]);

  const selected = selectedCompanyId ? companies.find((c) => c.id === selectedCompanyId) : undefined;

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        Search for an existing company. Staff members cannot create a new company from this flow.
      </p>

      <OnboardingFormField label="Search company" required>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Company name…" autoComplete="off" />
      </OnboardingFormField>

      {selected ? (
        <div className="rounded-lg border border-border-focus bg-surface-raised p-4 text-sm shadow-brand">
          <p className="font-medium text-text-primary">Selected</p>
          <p className="mt-1 text-text-secondary">{selected.name}</p>
        </div>
      ) : null}

      <div className="rounded-lg border border-border-default bg-surface-base">
        <ul className="max-h-72 divide-y divide-border-default overflow-y-auto">
          {matches.length === 0 ? (
            <li className="px-3 py-4 text-sm text-text-secondary">No companies match this search.</li>
          ) : (
            matches.map((c) => {
              const plans = activePlanCountForCompany(subscriptions, c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCompany(c)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 px-3 py-3 text-left text-sm transition-colors hover:bg-surface-raised sm:flex-row sm:items-center sm:justify-between',
                      selectedCompanyId === c.id && 'bg-surface-raised shadow-brand',
                    )}
                  >
                    <span className="font-medium text-text-primary">{c.name}</span>
                    <span className="text-xs text-text-secondary">
                      {c.niche ? `${c.niche} · ` : ''}
                      {plans} active plan{plans === 1 ? '' : 's'}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {companies.length === 0 ? (
        <div className="rounded-lg border border-border-default bg-surface-raised p-4 text-sm text-text-secondary">
          <p>Create a company first.</p>
          <Link
            href={`/admin/companies/create?returnTo=${RETURN_TO}`}
            className="mt-2 inline-block font-medium text-text-brand hover:underline"
          >
            Open company creation wizard
          </Link>
        </div>
      ) : null}
    </div>
  );
}
