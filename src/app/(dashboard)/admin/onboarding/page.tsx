import { Suspense } from 'react';
import { AdminUserOnboardingClient } from '@/app/(dashboard)/admin/onboarding/admin-user-onboarding-client';
import { PageMeta } from '@/components/layout/page-meta';

export default function AdminOnboardingPage(): JSX.Element {
  return (
    <section>
      <PageMeta
        title="Create user"
        description="Add a staff member to an existing company. To create a new company and its admin, use the company creation flow first."
      />
      <Suspense fallback={<p className="text-sm text-text-secondary">Loading…</p>}>
        <AdminUserOnboardingClient />
      </Suspense>
    </section>
  );
}
