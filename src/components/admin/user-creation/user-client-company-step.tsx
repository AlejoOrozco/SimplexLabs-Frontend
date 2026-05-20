'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import type { Company } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

const RETURN_TO = encodeURIComponent('/admin/onboarding?mode=client');

interface UserClientCompanyStepProps {
  companies: readonly Company[];
  selectedCompanyId: string | null;
  initialSearch: string;
  onSelectCompany: (company: Company) => void;
}

export function UserClientCompanyStep({
  companies,
  selectedCompanyId,
  initialSearch,
  onSelectCompany,
}: UserClientCompanyStepProps): JSX.Element {
  const [query, setQuery] = useState(initialSearch);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return companies.slice(0, 12);
    return companies.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 12);
  }, [companies, query]);

  const selected = selectedCompanyId ? companies.find((c) => c.id === selectedCompanyId) : undefined;

  return (
    <div className="space-y-6">
      <OnboardingFormField label="Search company by name" required>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Start typing…" autoComplete="off" />
      </OnboardingFormField>

      {selected ? (
        <div className="rounded-lg border border-border-focus bg-surface-raised p-4 text-sm shadow-brand">
          <p className="font-medium text-text-primary">Selected</p>
          <p className="mt-1 text-text-secondary">{selected.name}</p>
        </div>
      ) : null}

      <div className="rounded-lg border border-border-default bg-surface-base">
        <p className="border-b border-border-default px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Results
        </p>
        <ul className="max-h-64 divide-y divide-border-default overflow-y-auto">
          {matches.length === 0 ? (
            <li className="px-3 py-4 text-sm text-text-secondary">No companies match this search.</li>
          ) : (
            matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelectCompany(c)}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-3 text-left text-sm transition-colors hover:bg-surface-raised',
                    selectedCompanyId === c.id && 'bg-surface-raised shadow-brand',
                  )}
                >
                  <span className="font-medium text-text-primary">{c.name}</span>
                  <span className="text-xs text-text-secondary">{c.niche}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {query.trim().length > 0 && matches.length === 0 ? (
        <div className="rounded-lg border border-border-default bg-surface-raised p-4 text-sm text-text-secondary">
          <p>This company does not exist yet.</p>
          <ButtonLinkToCreateCompany />
        </div>
      ) : null}

      {query.trim().length === 0 && companies.length === 0 ? (
        <div className="rounded-lg border border-border-default bg-surface-raised p-4 text-sm text-text-secondary">
          <p>No companies in the system yet.</p>
          <ButtonLinkToCreateCompany />
        </div>
      ) : null}
    </div>
  );
}

function ButtonLinkToCreateCompany(): JSX.Element {
  return (
    <Link
      href={`/admin/companies/create?returnTo=${RETURN_TO}`}
      className="mt-3 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-medium text-text-inverse hover:bg-brand-dark"
    >
      Create company first
    </Link>
  );
}
