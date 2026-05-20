'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AgentRunDebugView } from '@/components/admin/failed-tasks/agent-run-debug-view';
import { TableCell, TableRow } from '@/components/ui/table';
import { detectFailedAgent } from '@/lib/admin/detect-failed-agent';
import { adminCompanyConversationHref } from '@/lib/admin/admin-company-workspace-href';
import type { AgentRun } from '@/lib/types/agent-pipeline-failure';
import { AgentPipelineStep } from '@/lib/types/agent-pipeline-failure';
import { formatTimeAgo } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface FailedTaskRowProps {
  task: AgentRun;
}

export function FailedTaskRow({ task }: FailedTaskRowProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const failedAgent = detectFailedAgent(task);
  const conversationHref = adminCompanyConversationHref(
    task.conversation.companyId,
    task.conversation.id,
  );

  return (
    <>
      <TableRow
        className={cn('cursor-pointer transition-colors hover:bg-surface-raised', expanded && 'bg-surface-raised')}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <TableCell className="font-medium text-text-primary">{task.conversation.company.name}</TableCell>
        <TableCell className="max-w-xs truncate text-sm text-text-primary" title={task.message.content}>
          {task.message.content}
        </TableCell>
        <TableCell>
          <Badge variant="destructive">{failedAgent}</Badge>
        </TableCell>
        <TableCell className="max-w-xs truncate text-sm text-text-secondary" title={task.error ?? undefined}>
          {task.error ?? (failedAgent === AgentPipelineStep.UNKNOWN ? 'Unknown error' : 'See trace below')}
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm text-text-secondary">{formatTimeAgo(task.createdAt)}</TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Link href={conversationHref} className="text-sm text-text-brand hover:underline">
            View conversation →
          </Link>
        </TableCell>
      </TableRow>
      {expanded ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={6} className="bg-surface-sunken p-4 align-top">
            <AgentRunDebugView task={task} />
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
