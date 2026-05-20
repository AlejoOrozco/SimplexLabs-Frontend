import Link from 'next/link';
import { AdminCompaniesDirectory } from '@/components/admin/admin-companies-directory';
import { PageMeta } from '@/components/layout/page-meta';
import { Button } from '@/components/ui/button';

export default function AdminCompaniesPage(): JSX.Element {
  return (
    <section>
      <PageMeta
        title="Companies"
        description="Registered organizations and quick links into each company workspace."
      />
      <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
        <Button type="button" size="sm" className="shrink-0" asChild>
          <Link href="/admin/companies/create">New company</Link>
        </Button>
      </div>
      <AdminCompaniesDirectory />
    </section>
  );
}
