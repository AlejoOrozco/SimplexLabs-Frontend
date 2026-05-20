import { Suspense } from 'react';
import { AdminCompanyWorkspaceShell } from '@/components/admin/client-detail/admin-client-detail-shell';

interface AdminCompanyDetailPageProps {
  params: { companyId: string };
}

export default function AdminCompanyDetailPage({ params }: AdminCompanyDetailPageProps): JSX.Element {
  return (
    <Suspense fallback={<p className="text-sm text-text-secondary">Loading company workspace…</p>}>
      <AdminCompanyWorkspaceShell companyId={params.companyId} />
    </Suspense>
  );
}
