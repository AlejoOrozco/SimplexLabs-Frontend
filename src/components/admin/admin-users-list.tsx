'use client';

import { useRouter } from 'next/navigation';
import { useAdminCompanies } from '@/lib/hooks/use-admin-companies';
import { useUsers } from '@/lib/hooks/use-users';
import { UserList } from '@/components/users/UserList';

export function AdminUsersList(): JSX.Element {
  const router = useRouter();
  const { data: users = [], isLoading } = useUsers();
  const { data: companies = [] } = useAdminCompanies();

  if (isLoading) {
    return <p className="text-sm text-text-secondary">Loading users…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-secondary">
        {companies.length === 0 ? 'No companies loaded — user list may be empty until companies exist.' : null}
      </p>
      <UserList
        users={users}
        onRowClick={(u) => {
          router.push(`/admin/users/${u.id}/permissions`);
        }}
      />
      <p className="text-xs text-text-secondary">
        Use <span className="font-medium">New user</span> above to add users without leaving this page.
      </p>
    </div>
  );
}
