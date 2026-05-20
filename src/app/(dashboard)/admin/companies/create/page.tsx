import { CompanyCreationWizard } from '@/components/admin/company-creation/company-creation-wizard';
import { PageMeta } from '@/components/layout/page-meta';

interface AdminCompanyCreatePageProps {
  searchParams: { returnTo?: string };
}

export default function AdminCompanyCreatePage({ searchParams }: AdminCompanyCreatePageProps): JSX.Element {
  const returnTo = typeof searchParams.returnTo === 'string' && searchParams.returnTo.length > 0 ? searchParams.returnTo : null;
  return (
    <section>
      <PageMeta
        title="Create company"
        description="Configure the organization, plans, agent, and WhatsApp without creating a user account."
      />
      <CompanyCreationWizard returnTo={returnTo} />
    </section>
  );
}
