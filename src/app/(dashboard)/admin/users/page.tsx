import { AdminUsersList } from '@/components/admin/admin-users-list';

export default function AdminUsersPage(): JSX.Element {
  return (
    <section>
      <h1 className="text-xl font-semibold text-text-primary">Users</h1>
      <p className="mt-2 text-sm text-text-secondary">All users across companies. Click a row to manage permissions.</p>
      <div className="mt-6">
        <AdminUsersList />
      </div>
    </section>
  );
}
