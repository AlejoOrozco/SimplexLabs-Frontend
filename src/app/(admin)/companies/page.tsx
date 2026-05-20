import { PageMeta } from '@/components/layout/page-meta';

export default function AdminCompaniesPage(): JSX.Element {
  return (
    <section>
      <PageMeta
        title="Companies"
        description="Cross-company read-only operational overview for SUPER_ADMIN."
      />
    </section>
  );
}
