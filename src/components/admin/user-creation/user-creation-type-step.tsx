'use client';

import { Building2, Users } from 'lucide-react';
import type { UserCreationMode } from '@/lib/types/admin-provisioning';
import { cn } from '@/lib/utils/cn';

interface UserCreationTypeStepProps {
  onSelect: (mode: UserCreationMode) => void;
}

export function UserCreationTypeStep({ onSelect }: UserCreationTypeStepProps): JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onSelect('client')}
        className={cn(
          'flex flex-col items-start gap-3 rounded-xl border-2 border-border-default bg-surface-page p-6 text-left transition-colors hover:border-brand-500 hover:bg-brand-50',
        )}
      >
        <Building2 className="size-10 text-brand-600" aria-hidden />
        <div>
          <p className="text-lg font-semibold text-text-primary">New client</p>
          <p className="mt-1 text-sm text-text-secondary">
            A business owner who needs their own company. They become company admin for the organization you select or
            create first.
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelect('staff')}
        className={cn(
          'flex flex-col items-start gap-3 rounded-xl border-2 border-border-default bg-surface-page p-6 text-left transition-colors hover:border-brand-500 hover:bg-brand-50',
        )}
      >
        <Users className="size-10 text-brand-600" aria-hidden />
        <div>
          <p className="text-lg font-semibold text-text-primary">Staff member</p>
          <p className="mt-1 text-sm text-text-secondary">
            An employee joining an existing company. Plans, agent, and WhatsApp come from the company automatically.
          </p>
        </div>
      </button>
    </div>
  );
}
