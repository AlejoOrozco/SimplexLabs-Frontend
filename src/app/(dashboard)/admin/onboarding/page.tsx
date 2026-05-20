import { Suspense } from 'react';
import { AdminUserOnboardingClient } from '@/app/(dashboard)/admin/onboarding/admin-user-onboarding-client';

export default function AdminOnboardingPage(): JSX.Element {
  return (
    <section>
      <h1 className="text-xl font-semibold text-text-primary">Create user</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Add a new client (company admin) or a staff member to an existing company. Company setup lives in a separate
        flow.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-text-secondary">Loading…</p>}>
          <AdminUserOnboardingClient />
        </Suspense>
      </div>
    </section>
  );
}
