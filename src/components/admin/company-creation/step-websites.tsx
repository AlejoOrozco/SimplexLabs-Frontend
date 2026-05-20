'use client';

import { Globe, X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { companyHasWebsitePlan } from '@/lib/onboarding/company-creation-wizard-navigation';
import type { CompanyWizardState } from '@/lib/types/company-creation-wizard-state';

interface StepWebsitesProps {
  state: CompanyWizardState;
  onUpdate: Dispatch<SetStateAction<CompanyWizardState>>;
}

export function StepWebsites({ state, onUpdate }: StepWebsitesProps): JSX.Element {
  if (!companyHasWebsitePlan(state)) {
    return (
      <div className="rounded-lg border border-border-default bg-surface-raised p-6 text-center">
        <Globe className="mx-auto mb-3 h-8 w-8 text-text-secondary" aria-hidden />
        <p className="text-sm font-medium text-text-primary">No website plan selected</p>
        <p className="mt-1 text-sm text-text-secondary">
          Go back to Plans and select a Website plan to assign URLs here. You can also add websites later from the
          company detail panel.
        </p>
      </div>
    );
  }

  const websites = state.websites ?? [];

  const addWebsite = (): void => {
    onUpdate((s) => ({
      ...s,
      websites: [...(s.websites ?? []), { url: '', label: '', isActive: true }],
    }));
  };

  const removeWebsite = (index: number): void => {
    onUpdate((s) => ({
      ...s,
      websites: (s.websites ?? []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-primary">Website URLs</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Optional — you can add these now or after the company is created.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addWebsite}>
          + Add URL
        </Button>
      </div>

      {websites.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-secondary">
          No websites added yet. Click &quot;Add URL&quot; or skip — you can assign URLs later.
        </p>
      ) : null}

      {websites.map((website, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Input
              placeholder="https://company.com"
              value={website.url}
              onChange={(e) => {
                const next = [...websites];
                const row = next[index];
                if (!row) return;
                next[index] = { ...row, url: e.target.value };
                onUpdate((s) => ({ ...s, websites: next }));
              }}
            />
            <Input
              placeholder="Label (optional)"
              value={website.label}
              onChange={(e) => {
                const next = [...websites];
                const row = next[index];
                if (!row) return;
                next[index] = { ...row, label: e.target.value };
                onUpdate((s) => ({ ...s, websites: next }));
              }}
            />
          </div>
          <button
            type="button"
            className="mt-2 shrink-0 text-text-secondary transition-colors hover:text-error"
            aria-label="Remove website row"
            onClick={() => removeWebsite(index)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
