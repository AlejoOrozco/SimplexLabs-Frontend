'use client';

import Link from 'next/link';
import { FailedTaskRow } from '@/components/admin/failed-tasks/failed-task-row';
import { PageMeta } from '@/components/layout/page-meta';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonTable } from '@/components/shared/Skeleton';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminFailedAgentRuns } from '@/lib/hooks/use-admin-failed-tasks';

export function FailedTasksAdminView(): JSX.Element {
  const query = useAdminFailedAgentRuns();

  if (query.isLoading) {
    return <SkeletonTable />;
  }

  if (query.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4">
        <p className="font-medium text-error-dark">Could not load failed agent runs.</p>
        <p className="mt-2 text-sm text-error-dark/90">
          Ensure <code className="rounded bg-error-surface px-1">GET /admin/failed-tasks</code> is implemented and you are
          signed in as a super admin.
        </p>
        <button
          type="button"
          className="mt-3 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-sm"
          onClick={() => void query.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const tasks = query.data ?? [];

  return (
    <div className="space-y-4">
      <PageMeta
        title="Failed agent tasks"
        description="Cross-company pipeline failures. Expand a row for the full agent_runs JSON."
      />
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link href="/dashboard" className="text-sm text-text-brand hover:underline">
          ← Platform overview
        </Link>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No failed tasks"
          description="When the agent pipeline errors, failed runs will appear here for triage."
        />
      ) : (
        <div className="rounded-lg border border-border-default bg-surface-base">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Trigger message</TableHead>
                <TableHead>Failed agent</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Conversation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <FailedTaskRow key={task.id} task={task} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
