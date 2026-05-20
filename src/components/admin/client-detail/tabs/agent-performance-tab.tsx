'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { buildAgentPerformanceSnapshot } from '@/lib/admin/build-agent-performance-snapshot';
import { getConversations } from '@/features/conversations/api/conversations.api';

interface AgentPerformanceTabProps {
  companyId: string;
}

export function AgentPerformanceTab({ companyId }: AgentPerformanceTabProps): JSX.Element {
  const conversationsQuery = useQuery({
    queryKey: ['admin', 'company', companyId, 'conversations'],
    queryFn: async () => {
      const all = await getConversations();
      return all.filter((c) => c.companyId === companyId);
    },
  });

  if (conversationsQuery.isLoading) {
    return <p className="text-sm text-text-secondary">Loading conversation metrics…</p>;
  }
  if (conversationsQuery.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-light p-4 text-sm text-error-dark">
        Could not load agent performance data.
      </div>
    );
  }

  const snapshot = buildAgentPerformanceSnapshot(conversationsQuery.data ?? []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <p className="text-xs text-text-secondary">Agent run success rate (proxy)</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {snapshot.agentSuccessRatePercent !== null ? `${snapshot.agentSuccessRatePercent}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Share of conversations in a closed or resolved lifecycle state (labels vary by backend).
          </p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <p className="text-xs text-text-secondary">Average response time</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
          <p className="mt-1 text-xs text-text-secondary">Requires message-level timing from the analytics API.</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <p className="text-xs text-text-secondary">Token usage this month</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
          <p className="mt-1 text-xs text-text-secondary">Wire to billing or observability when available.</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <p className="text-xs text-text-secondary">Total conversations</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{snapshot.totalConversations}</p>
        </div>
      </div>

      <section className="rounded-lg border border-border-default bg-surface-page p-4">
        <h3 className="text-sm font-semibold text-text-primary">Lifecycle mix</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {snapshot.lifecycleBreakdown.length === 0 ? (
            <li className="text-text-secondary">No data.</li>
          ) : (
            snapshot.lifecycleBreakdown.map((row) => (
              <li key={row.label} className="flex justify-between gap-2">
                <span className="text-text-secondary">{row.label}</span>
                <span className="font-medium tabular-nums">{row.count}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-lg border border-border-default bg-surface-page p-4">
        <h3 className="text-sm font-semibold text-text-primary">Most common intents</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Intent histogram needs aggregated analytics from agent runs. Until then, inspect individual threads from
          the Conversations tab.
        </p>
      </section>

      <section className="rounded-lg border border-border-default bg-surface-page p-4">
        <h3 className="text-sm font-semibold text-text-primary">Recent failures</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Per-company failure feeds will map here. Use the platform DLQ for now.
        </p>
        <Link href="/admin/failed-tasks" className="mt-2 inline-block text-sm text-text-brand underline">
          Open failed tasks
        </Link>
      </section>
    </div>
  );
}
