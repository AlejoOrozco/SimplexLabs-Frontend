'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PageMeta } from '@/components/layout/page-meta';
import { UserPermissionsPanel } from '@/components/permissions/user-permissions-panel';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { getUser } from '@/lib/api/users.api';
import { fullName } from '@/lib/utils/format';

export default function AdminUserPermissionsPage(): JSX.Element {
  const params = useParams();
  const userId = typeof params.userId === 'string' ? params.userId : '';

  const userQuery = useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: () => getUser(userId),
    enabled: Boolean(userId),
  });

  const displayName =
    userQuery.data !== undefined
      ? fullName({
          firstName: userQuery.data.firstName,
          lastName: userQuery.data.lastName,
        })
      : 'User permissions';

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <PageMeta
        title={displayName}
        description="Manage overrides for this user. Role defaults still apply unless toggled here."
      />

      {userQuery.isLoading ? <SkeletonCard /> : null}
      {userQuery.isError ? (
        <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
          Could not load this user.
        </div>
      ) : null}

      {userQuery.data ? <UserPermissionsPanel userId={userId} userName={displayName} /> : null}
    </section>
  );
}
