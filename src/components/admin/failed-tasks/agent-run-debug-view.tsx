'use client';

import type { AgentRun } from '@/lib/types/agent-pipeline-failure';

interface AgentRunDebugViewProps {
  task: AgentRun;
}

export function AgentRunDebugView({ task }: AgentRunDebugViewProps): JSX.Element {
  const payload = task.agentRuns ?? { steps: task.steps, failedStep: task.failedStep, topLevelError: task.error };
  const text = JSON.stringify(payload, null, 2);

  return (
    <div className="rounded-md border border-border-default bg-surface-sunken">
      <p className="border-b border-border-default bg-surface-raised px-3 py-2 text-xs font-medium text-text-primary">
        agent_runs (full trace)
      </p>
      <pre className="max-h-[min(70vh,560px)] overflow-auto p-3 font-mono text-xs text-text-primary">{text}</pre>
    </div>
  );
}
