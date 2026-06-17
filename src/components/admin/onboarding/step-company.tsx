'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import type { OnboardingStepProps } from '@/components/admin/onboarding/onboarding-step-props';
import { useAdminCompanies } from '@/lib/hooks/use-admin-companies';
import { Niche } from '@/lib/types';
import { nicheLabel } from '@/lib/utils/format';

const NICHES: readonly Niche[] = [Niche.GYM, Niche.MEDICAL, Niche.ENTREPRENEUR];

export function StepCompany({ state, onUpdate }: OnboardingStepProps): JSX.Element {
  const { data: companies = [], isLoading } = useAdminCompanies();
  const { company } = state;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={company.mode === 'new' ? 'default' : 'outline'}
          onClick={() =>
            onUpdate((s) => ({
              ...s,
              company: {
                ...s.company,
                mode: 'new',
                existingCompanyId: undefined,
                niche: s.company.niche ?? Niche.GYM,
              },
            }))
          }
        >
          New company
        </Button>
        <Button
          type="button"
          variant={company.mode === 'existing' ? 'default' : 'outline'}
          onClick={() =>
            onUpdate((s) => ({
              ...s,
              company: { ...s.company, mode: 'existing', name: undefined, niche: undefined },
            }))
          }
        >
          Existing company
        </Button>
      </div>

      {company.mode === 'existing' ? (
        <OnboardingFormField label="Company" required>
          <Select
            disabled={isLoading}
            value={company.existingCompanyId ?? ''}
            onValueChange={(existingCompanyId) =>
              onUpdate((s) => ({ ...s, company: { ...s.company, existingCompanyId } }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? 'Loading…' : 'Select a company'} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </OnboardingFormField>
      ) : (
        <>
          <OnboardingFormField label="Company name" required>
            <Input
              value={company.name ?? ''}
              onChange={(e) =>
                onUpdate((s) => ({ ...s, company: { ...s.company, name: e.target.value } }))
              }
              placeholder="Juanito's Shoes"
            />
          </OnboardingFormField>
          <OnboardingFormField label="Niche" required>
            <Select
              value={company.niche ?? Niche.GYM}
              onValueChange={(niche) =>
                onUpdate((s) => ({
                  ...s,
                  company: { ...s.company, niche: niche as Niche },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {nicheLabel(n)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </OnboardingFormField>
          <OnboardingFormField label="Phone">
            <Input
              type="tel"
              value={company.phone ?? ''}
              onChange={(e) =>
                onUpdate((s) => ({ ...s, company: { ...s.company, phone: e.target.value } }))
              }
            />
          </OnboardingFormField>
          <OnboardingFormField label="Address">
            <Textarea
              value={company.address ?? ''}
              onChange={(e) =>
                onUpdate((s) => ({ ...s, company: { ...s.company, address: e.target.value } }))
              }
              rows={3}
            />
          </OnboardingFormField>
          <OnboardingFormField label="Notification phone">
            <Input
              type="tel"
              value={company.notificationPhone ?? ''}
              onChange={(e) =>
                onUpdate((s) => ({
                  ...s,
                  company: { ...s.company, notificationPhone: e.target.value },
                }))
              }
            />
          </OnboardingFormField>
          <OnboardingFormField label="Notification email">
            <Input
              type="email"
              value={company.notificationEmail ?? ''}
              onChange={(e) =>
                onUpdate((s) => ({
                  ...s,
                  company: { ...s.company, notificationEmail: e.target.value },
                }))
              }
            />
          </OnboardingFormField>
        </>
      )}
    </div>
  );
}
