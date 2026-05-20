'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { useUpdateUserPermissions, useUserPermissionsForManagement } from '@/lib/hooks/use-permissions';
import type { ManagedPermissionRow, UserPermissionsManagementMap } from '@/lib/types';
import { notify } from '@/lib/toast';

interface UserPermissionsPanelProps {
  userId: string;
  userName: string;
}

function countEnabled(
  permissions: readonly ManagedPermissionRow[],
  pendingChanges: Record<string, boolean>,
): number {
  return permissions.filter((p) =>
    pendingChanges[p.key] !== undefined ? pendingChanges[p.key] : p.isGranted,
  ).length;
}

function PermissionsPanelSkeleton(): JSX.Element {
  return <SkeletonCard />;
}

export function UserPermissionsPanel({ userId, userName }: UserPermissionsPanelProps): JSX.Element {
  const { data: groups, isLoading } = useUserPermissionsForManagement(userId);
  const updatePermissions = useUpdateUserPermissions();

  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

  const handleToggle = (key: string, newValue: boolean): void => {
    setPendingChanges((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleSave = async (): Promise<void> => {
    const updates = Object.entries(pendingChanges).map(([permissionKey, isGranted]) => ({
      permissionKey,
      isGranted,
    }));

    await updatePermissions.mutateAsync({ userId, updates });
    setPendingChanges({});
    notify.success('Permissions updated', { description: `Changes saved for ${userName}` });
  };

  if (isLoading) return <PermissionsPanelSkeleton />;

  const entries = Object.entries((groups ?? {}) as UserPermissionsManagementMap);
  const pendingCount = Object.keys(pendingChanges).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Permissions for {userName}</h3>
          <p className="mt-0.5 text-sm text-text-secondary">
            Toggle individual permissions. Changes override role defaults.
          </p>
        </div>
        {pendingCount > 0 ? (
          <Button
            type="button"
            size="sm"
            disabled={updatePermissions.isPending}
            onClick={() => void handleSave()}
          >
            {updatePermissions.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              <>
                Save {pendingCount} change{pendingCount > 1 ? 's' : ''}
              </>
            )}
          </Button>
        ) : null}
      </div>

      {entries.map(([groupName, permissions]) => (
        <div
          key={groupName}
          className="overflow-hidden rounded-xl border border-border-default bg-surface-page"
        >
          <div className="flex items-center justify-between border-b border-border-default bg-surface-raised px-4 py-3">
            <span className="text-sm font-semibold text-text-primary">{groupName}</span>
            <span className="text-xs text-text-secondary">
              {countEnabled(permissions, pendingChanges)} / {permissions.length} enabled
            </span>
          </div>
          <div className="divide-y divide-border-default">
            {permissions.map((p) => {
              const currentValue =
                (pendingChanges[p.key] !== undefined ? pendingChanges[p.key] : p.isGranted) ?? false;

              return (
                <div key={p.key} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{p.label}</span>
                      {p.isOverridden ? (
                        <span className="rounded-full border border-warning bg-warning-light px-1.5 py-0.5 text-xs text-warning-dark">
                          Custom
                        </span>
                      ) : null}
                    </div>
                    {p.description ? (
                      <p className="mt-0.5 text-xs text-text-secondary">{p.description}</p>
                    ) : null}
                  </div>
                  <Switch checked={currentValue} onCheckedChange={(val) => handleToggle(p.key, val)} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
