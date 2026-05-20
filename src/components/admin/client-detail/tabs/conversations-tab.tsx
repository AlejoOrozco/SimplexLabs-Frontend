'use client';

import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonTable } from '@/components/shared/Skeleton';
import { ConversationRow } from '@/features/conversations/components/conversation-row';
import { getConversations } from '@/features/conversations/api/conversations.api';

interface ConversationsTabProps {
  companyId: string;
}

export function ConversationsTab({ companyId }: ConversationsTabProps): JSX.Element {
  const query = useQuery({
    queryKey: ['admin', 'company', companyId, 'conversations'],
    queryFn: async () => {
      const all = await getConversations();
      return all.filter((c) => c.companyId === companyId);
    },
  });

  if (query.isLoading) {
    return <SkeletonTable />;
  }
  if (query.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-light p-4 text-sm text-error-dark">
        Could not load conversations.
      </div>
    );
  }

  const rows = query.data ?? [];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-text-primary">
        <span className="font-semibold">Read only</span>
        <span className="text-text-secondary"> — You can open threads to review messages. Sending and takeover are disabled.</span>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No conversations" description="This company has no conversation threads yet." />
      ) : (
        <ul className="space-y-2">
          {rows.map((conversation) => (
            <li key={conversation.id}>
              <ConversationRow
                conversation={conversation}
                threadHref={`/admin/clients/${companyId}/conversations/${conversation.id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
