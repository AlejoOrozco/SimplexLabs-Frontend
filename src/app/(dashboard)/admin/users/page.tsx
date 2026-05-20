import Link from 'next/link';
import { AdminUsersList } from '@/components/admin/admin-users-list';
import { PageMeta } from '@/components/layout/page-meta';
import { Button } from '@/components/ui/button';

export default function AdminUsersPage(): JSX.Element {
  return (
    <section>
      <PageMeta
        title="Users"
        description="All users across companies. Click a row to manage permissions."
      />
      <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
        <Button type="button" size="sm" className="shrink-0" asChild>
          <Link href="/admin/onboarding">New user</Link>
        </Button>
      </div>
      <AdminUsersList />
    </section>
  );
}
