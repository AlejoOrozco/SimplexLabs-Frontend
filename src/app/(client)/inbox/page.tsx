'use client';

import { useMemo } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { PermissionGate } from '@/components/shared/permission-gate';
import { SkeletonTable } from '@/components/shared/Skeleton';
import { ConversationRow } from '@/features/conversations/components/conversation-row';
import { useConversationList } from '@/features/conversations/hooks/use-conversation-list';
import { PageMeta } from '@/components/layout/page-meta';

export default function InboxPage(): JSX.Element {
  const query = useConversationList({ channel: 'WHATSAPP' });

  const rows = useMemo(
    () => query.data?.pages.flatMap((page) => page) ?? [],
    [query.data],
  );

  return (
    <PermissionGate
      permission="company.conversations.view"
      permissions={['company.conversations.manage', 'company.conversations.take_control']}
      fallback={
        <div className="rounded-lg border border-border-default p-6 text-sm text-text-secondary">
          You do not have permission to view conversations.
        </div>
      }
    >
      <PageMeta title="Inbox" description="WhatsApp and messaging conversations with your customers." />
      {query.isLoading ? <SkeletonTable /> : null}
      {query.isError ? (
        <div className="rounded-lg border border-error bg-error-surface p-4">
          <p className="font-medium text-error-dark">Failed to load inbox.</p>
          <button
            type="button"
            className="mt-3 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-sm"
            onClick={() => void query.refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}
      {!query.isLoading && !query.isError && rows.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Messages from your customers on WhatsApp will appear here."
        />
      ) : null}
      {!query.isLoading && !query.isError && rows.length > 0 ? (
        <section className="space-y-2">
          {rows.map((conversation) => (
            <ConversationRow key={conversation.id} conversation={conversation} />
          ))}
        </section>
      ) : null}
    </PermissionGate>
  );
}
