'use client';

import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAdminPermissionWizardTemplate } from '@/lib/hooks/use-admin-permission-wizard-template';
import type { UserWizardState } from '@/lib/types/user-creation-wizard-state';
import type { UserPermissionsManagementMap } from '@/lib/types';

interface UserStaffRoleStepProps {
  state: UserWizardState;
  onUpdate: (updater: (s: UserWizardState) => UserWizardState) => void;
}

function templateToOverrides(groups: UserPermissionsManagementMap): Array<{ permissionKey: string; isGranted: boolean }> {
  const out: Array<{ permissionKey: string; isGranted: boolean }> = [];
  for (const rows of Object.values(groups)) {
    for (const row of rows) {
      out.push({ permissionKey: row.key, isGranted: row.isGranted });
    }
  }
  return out;
}

function isGrantedForKey(
  state: UserWizardState,
  key: string,
  templateDefault: boolean,
): boolean {
  const row = state.permissionOverrides.find((o) => o.permissionKey === key);
  if (row) return row.isGranted;
  return templateDefault;
}

export function UserStaffRoleStep({ state, onUpdate }: UserStaffRoleStepProps): JSX.Element {
  const templateQuery = useAdminPermissionWizardTemplate(state.role);

  useEffect(() => {
    if (!templateQuery.data) return;
    if (state.permissionOverrides.length > 0) return;
    onUpdate((s) => ({
      ...s,
      permissionOverrides: templateToOverrides(templateQuery.data as UserPermissionsManagementMap),
    }));
  }, [onUpdate, state.permissionOverrides.length, templateQuery.data]);

  const groups = templateQuery.data;
  const entries = groups ? Object.entries(groups) : [];

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
        <div className="space-y-4">
          {templateQuery.isLoading ? <p className="text-sm text-text-secondary">Loading permissions…</p> : null}
          {templateQuery.isError ? (
            <p className="text-sm text-error-dark">
              Could not load permission defaults. The account will still be created; you can tune permissions afterward
              from the user profile.
            </p>
          ) : null}
          {entries.map(([groupName, permissions]) => (
            <div key={groupName} className="overflow-hidden rounded-xl border border-border-default bg-surface-page">
              <div className="border-b border-border-default bg-surface-raised px-4 py-2 text-sm font-semibold text-text-primary">
                {groupName}
              </div>
              <div className="divide-y divide-border-default">
                {permissions.map((p) => {
                  const checked = isGrantedForKey(state, p.key, p.isGranted);
                  return (
                    <div key={p.key} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary">{p.label}</p>
                        {p.description ? <p className="mt-0.5 text-xs text-text-secondary">{p.description}</p> : null}
                      </div>
                      <Switch
                        checked={checked}
                        onCheckedChange={(v) =>
                          onUpdate((s) => {
                            const next = [...s.permissionOverrides];
                            const idx = next.findIndex((o) => o.permissionKey === p.key);
                            if (idx >= 0) {
                              next[idx] = { permissionKey: p.key, isGranted: v };
                            } else {
                              next.push({ permissionKey: p.key, isGranted: v });
                            }
                            return { ...s, permissionOverrides: next };
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
