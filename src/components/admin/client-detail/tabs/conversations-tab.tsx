'use client';

import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonTable } from '@/components/shared/Skeleton';
import { ConversationRow } from '@/features/conversations/components/conversation-row';
import { listConversations } from '@/features/conversations/api/conversations.api';
import { adminCompanyConversationHref } from '@/lib/admin/admin-company-workspace-href';
import { useAuth } from '@/context/auth-context';

interface ConversationsTabProps {
  companyId: string;
}

export function ConversationsTab({ companyId }: ConversationsTabProps): JSX.Element {
  const { isSimplexAdmin, user } = useAuth();
  const shouldPoll = isSimplexAdmin && user?.companyId == null;

  const query = useQuery({
    queryKey: ['admin', 'company', companyId, 'conversations'],
    queryFn: async () => {
      const all = await listConversations();
      return all.filter((c) => c.companyId === companyId);
    },
    refetchInterval: shouldPoll ? 15_000 : false,
  });

  if (query.isLoading) {
    return <SkeletonTable />;
  }
  if (query.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
        Could not load conversations.
      </div>
    );
  }

  const rows = query.data ?? [];

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="rounded-lg border border-border-focus bg-surface-raised px-4 py-3 text-sm text-text-primary shadow-brand">
          <span className="font-semibold">Read only</span>
          <span className="text-text-secondary">
            {' '}
            — You can open threads to review messages. Sending and takeover are disabled.
          </span>
        </div>
        {shouldPoll ? (
          <p className="text-xs text-text-secondary">
            Live updates are not available in the platform admin view yet. This list refreshes every 15 seconds.
          </p>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No conversations" description="This company has no conversation threads yet." />
      ) : (
        <ul className="space-y-2">
          {rows.map((conversation) => (
            <li key={conversation.id}>
              <ConversationRow
                conversation={conversation}
                threadHref={adminCompanyConversationHref(companyId, conversation.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
