'use client';

import { PageMeta } from '@/components/layout/page-meta';
import { PermissionGate } from '@/components/shared/permission-gate';

export default function AgentProfileSettingsPage(): JSX.Element {
  return (
    <section>
      <PageMeta
        title="Agent profile"
        description="Configure persona, fallback and escalation messages, language defaults, and channel toggles."
      />
      <PermissionGate
        permission="company.agent.configure"
        fallback={
          <p className="text-sm text-text-secondary">Contact your administrator to edit agent settings.</p>
        }
      >
        <p className="text-sm text-text-secondary">Agent configuration controls will appear here.</p>
      </PermissionGate>
    </section>
  );
}
