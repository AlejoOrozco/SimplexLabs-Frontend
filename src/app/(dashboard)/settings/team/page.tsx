'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPermissionsPanel } from '@/components/permissions/user-permissions-panel';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { getUsers } from '@/lib/api/users.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import { fullName } from '@/lib/utils/format';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils/cn';

export default function TeamPermissionsPage(): JSX.Element {
  const { user } = useAuth();
  const companyId = user?.companyId ?? null;
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: getUsers,
    enabled: Boolean(companyId),
  });

  const teammates = useMemo(() => {
    const rows = usersQuery.data ?? [];
    if (!companyId) return [];
    return rows.filter((u) => u.companyId === companyId);
  }, [usersQuery.data, companyId]);

  useEffect(() => {
    if (selectedUserId !== null || teammates.length === 0) return;
    const first = teammates[0];
    if (first) setSelectedUserId(first.id);
  }, [selectedUserId, teammates]);

  const selected =
    selectedUserId !== null ? teammates.find((u) => u.id === selectedUserId) ?? null : null;

  return (
    <section className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Team & permissions</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Choose a teammate to review or adjust their individual permissions.
        </p>
      </div>

      {!companyId ? (
        <p className="text-sm text-text-secondary">You must belong to a company to manage team permissions.</p>
      ) : null}

      {usersQuery.isLoading ? <SkeletonCard /> : null}
      {usersQuery.isError ? (
        <p className="text-sm text-error-dark">Could not load users for your company.</p>
      ) : null}

      {companyId && !usersQuery.isLoading && teammates.length === 0 ? (
        <p className="text-sm text-text-secondary">No users found for your company.</p>
      ) : null}

      {teammates.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
          <nav className="space-y-1 rounded-xl border border-border-default bg-surface-page p-2">
            {teammates.map((u) => {
              const name = fullName(u);
              const active = u.id === selectedUserId;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUserId(u.id)}
                  className={cn(
                    'flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    active ? 'bg-brand-50 text-text-brand' : 'text-text-primary hover:bg-surface-raised',
                  )}
                >
                  <span className="font-medium">{name}</span>
                  <span className="text-xs text-text-secondary">{u.email}</span>
                </button>
              );
            })}
          </nav>

          <div className="min-w-0">
            {selected ? (
              <UserPermissionsPanel userId={selected.id} userName={fullName(selected)} />
            ) : (
              <p className="text-sm text-text-secondary">Select a team member to edit their permissions.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
