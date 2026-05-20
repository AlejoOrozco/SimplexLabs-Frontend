'use client';

import { PermissionGate } from '@/components/shared/permission-gate';

export default function AgentProfileSettingsPage(): JSX.Element {
  return (
    <section>
      <h1 className="text-xl font-semibold">Agent Profile</h1>
      <PermissionGate
        permission="company.agent.configure"
        fallback={
          <p className="mt-4 text-sm text-text-secondary">
            Contact your administrator to edit agent settings.
          </p>
        }
      >
        <p className="mt-2 text-sm text-slate-600">
          Configure persona, fallback and escalation messages, language defaults, and channel toggles.
        </p>
      </PermissionGate>
    </section>
  );
}
