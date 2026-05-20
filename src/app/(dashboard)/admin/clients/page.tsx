import { AdminClientsList } from '@/components/admin/admin-clients-list';

export default function AdminClientsPage(): JSX.Element {
  return (
    <section>
      <h1 className="text-xl font-semibold text-text-primary">Clients</h1>
      <p className="mt-2 text-sm text-text-secondary">Companies and their active subscriptions.</p>
      <div className="mt-6">
        <AdminClientsList />
      </div>
    </section>
  );
}
