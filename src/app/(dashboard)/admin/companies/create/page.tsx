import { CompanyCreationWizard } from '@/components/admin/company-creation/company-creation-wizard';

interface AdminCompanyCreatePageProps {
  searchParams: { returnTo?: string };
}

export default function AdminCompanyCreatePage({ searchParams }: AdminCompanyCreatePageProps): JSX.Element {
  const returnTo = typeof searchParams.returnTo === 'string' && searchParams.returnTo.length > 0 ? searchParams.returnTo : null;
  return (
    <section>
      <h1 className="text-xl font-semibold text-text-primary">Create company</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Configure the organization, plans, agent, and WhatsApp without creating a user account.
      </p>
      <div className="mt-8">
        <CompanyCreationWizard returnTo={returnTo} />
      </div>
    </section>
  );
}
