import { AdminCompaniesDirectory } from '@/components/admin/admin-companies-directory';

export default function AdminCompaniesPage(): JSX.Element {
  return (
    <section>
      <h1 className="text-xl font-semibold text-text-primary">Companies</h1>
      <p className="mt-2 text-sm text-text-secondary">Registered organizations and quick links into each client workspace.</p>
      <div className="mt-6">
        <AdminCompaniesDirectory />
      </div>
    </section>
  );
}
