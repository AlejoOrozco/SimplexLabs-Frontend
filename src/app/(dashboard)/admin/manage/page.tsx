import { AdminPlatformManagePage } from '@/components/admin/manage/platform/admin-platform-manage-page';
import { PageMeta } from '@/components/layout/page-meta';

export default function AdminManagePage(): JSX.Element {
  return (
    <section>
      <PageMeta
        title="Manage"
        description="Platform-wide plan catalog and quick entry into company workspaces."
      />
      <AdminPlatformManagePage />
    </section>
  );
}
