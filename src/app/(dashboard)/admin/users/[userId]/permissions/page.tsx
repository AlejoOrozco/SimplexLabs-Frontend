'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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
      : userId;

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <Link
          href="/admin"
          className="text-sm font-medium text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
        >
          ← Admin
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">User permissions</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage overrides for this user. Role defaults still apply unless toggled here.
        </p>
      </div>

      {userQuery.isLoading ? <SkeletonCard /> : null}
      {userQuery.isError ? (
        <div className="rounded-lg border border-error bg-error-light p-4 text-sm text-error-dark">
          Could not load this user.
        </div>
      ) : null}

      {userQuery.data ? <UserPermissionsPanel userId={userId} userName={displayName} /> : null}
    </section>
  );
}
