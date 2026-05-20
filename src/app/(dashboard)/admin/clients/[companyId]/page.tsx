import { Suspense } from 'react';
import { AdminClientDetailShell } from '@/components/admin/client-detail/admin-client-detail-shell';

interface AdminClientPageProps {
  params: { companyId: string };
}

export default function AdminClientDetailPage({ params }: AdminClientPageProps): JSX.Element {
  return (
    <Suspense fallback={<p className="text-sm text-text-secondary">Loading client workspace…</p>}>
      <AdminClientDetailShell companyId={params.companyId} />
    </Suspense>
  );
}
