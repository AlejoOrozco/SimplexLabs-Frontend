'use client';

import { useMemo, useState } from 'react';
import { ClientAccountActions } from '@/components/admin/client-detail/client-account-actions';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiClientError } from '@/lib/api/client';
import { isTenantTeamRole } from '@/lib/auth/session-role-utils';
import { useCompany, useUpdateCompany } from '@/lib/hooks/use-companies';
import { useUsers } from '@/lib/hooks/use-users';
import type { CreateCompanyDto } from '@/lib/schemas/company.schema';
import { notify } from '@/lib/toast';

interface SettingsTabProps {
  companyId: string;
}

export function SettingsTab({ companyId }: SettingsTabProps): JSX.Element {
  const companyQuery = useCompany(companyId);
  const updateCompany = useUpdateCompany(companyId);
  const usersQuery = useUsers();
  const [kbNotes, setKbNotes] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const primaryUser = useMemo(() => {
    const users = usersQuery.data ?? [];
    const clients = users.filter((u) => u.companyId === companyId && isTenantTeamRole(u.role));
    return clients.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  }, [usersQuery.data, companyId]);

  if (companyQuery.isLoading || !companyQuery.data) {
    return <p className="text-sm text-text-secondary">Loading…</p>;
  }

  const company = companyQuery.data;

  const handleCompanySave = async (values: CreateCompanyDto): Promise<void> => {
    try {
      await updateCompany.mutateAsync(values);
      notify.success('Company updated');
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Could not update company';
      notify.error(message);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border-default bg-surface-page p-4">
        <h3 className="text-sm font-semibold text-text-primary">Company (admin edit)</h3>
        <div className="mt-3">
          <CompanyForm
            defaultValues={{
              name: company.name,
              niche: company.niche,
              phone: company.phone,
              address: company.address,
            }}
            onSubmit={handleCompanySave}
            submitLabel={updateCompany.isPending ? 'Saving…' : 'Save company'}
          />
        </div>
      </section>

      <section className="rounded-lg border border-border-default bg-surface-page p-4">
        <h3 className="text-sm font-semibold text-text-primary">Agent configuration</h3>
        <p className="mt-1 text-xs text-text-secondary">
          Persona, fallback, escalation, and channel toggles will map to tenant agent settings once the admin proxy
          API is available. Capture notes below for now.
        </p>
        <div className="mt-3 space-y-2">
          <Label htmlFor="agent-notes">Internal notes</Label>
          <Textarea
            id="agent-notes"
            value={kbNotes}
            onChange={(e) => setKbNotes(e.target.value)}
            rows={3}
            placeholder="Changes requested by client…"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              notify.info('Persist agent configuration via upcoming admin settings API.');
            }}
          >
            Save agent notes (local only)
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border-default bg-surface-page p-4">
        <h3 className="text-sm font-semibold text-text-primary">Knowledge base</h3>
        <p className="mt-1 text-xs text-text-secondary">
          Listing and editing KB entries for another tenant requires a scoped admin endpoint. Track content requests
          here until wired.
        </p>
        <Textarea className="mt-3" rows={4} readOnly value="KB admin CRUD is not connected in this build." />
      </section>

      <section className="rounded-lg border border-border-default bg-surface-page p-4">
        <h3 className="text-sm font-semibold text-text-primary">WhatsApp number assignment</h3>
        <p className="mt-1 text-xs text-text-secondary">
          Assign or rotate WhatsApp sender IDs when the integration API supports admin writes.
        </p>
        <div className="mt-3 space-y-2">
          <Label htmlFor="wa-number">Display number</Label>
          <Input
            id="wa-number"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="+1…"
          />
          <Button type="button" variant="secondary" onClick={() => notify.info('WhatsApp assignment API pending.')}>
            Save assignment
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border-default bg-surface-page p-4">
        <h3 className="text-sm font-semibold text-text-primary">Account</h3>
        {primaryUser ? (
          <ClientAccountActions user={primaryUser} />
        ) : (
          <p className="mt-2 text-sm text-text-secondary">No client user to deactivate.</p>
        )}
      </section>
    </div>
  );
}
