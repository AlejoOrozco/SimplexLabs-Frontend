'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserWizardState } from '@/lib/types/user-creation-wizard-state';

interface UserStaffRoleStepProps {
  state: UserWizardState;
  onUpdate: (updater: (s: UserWizardState) => UserWizardState) => void;
}

export function UserStaffRoleStep({ state, onUpdate }: UserStaffRoleStepProps): JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-text-primary">Role</p>
        <Select
          value={state.role}
          onValueChange={(v) =>
            onUpdate((s) => ({
              ...s,
              role: v as 'COMPANY_ADMIN' | 'COMPANY_STAFF',
              permissionOverrides: [],
            }))
          }
        >
          <SelectTrigger className="mt-2 max-w-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COMPANY_ADMIN">Company admin</SelectItem>
            <SelectItem value="COMPANY_STAFF">Company staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state.role === 'COMPANY_ADMIN' ? (
        <p className="rounded-lg border border-border-default bg-surface-raised p-3 text-sm text-text-secondary">
          This person will have full control of the company.
        </p>
      ) : null}

      {state.role === 'COMPANY_STAFF' ? (
        <p className="rounded-lg border border-border-default bg-surface-raised p-3 text-sm text-text-secondary">
          Staff accounts start with the default permissions for the company staff role. After the account is
          created, you can customize access from the user&apos;s permissions page.
        </p>
      ) : null}
    </div>
  );
}
