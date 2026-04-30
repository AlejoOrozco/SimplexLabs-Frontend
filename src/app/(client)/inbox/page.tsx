'use client';

import { useMemo } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonTable } from '@/components/shared/Skeleton';
import { ConversationRow } from '@/features/conversations/components/conversation-row';
import { useConversationList } from '@/features/conversations/hooks/use-conversation-list';

export default function InboxPage(): JSX.Element {
  const query = useConversationList();

  const rows = useMemo(
    () => query.data?.pages.flatMap((page) => page) ?? [],
    [query.data],
  );

  if (query.isLoading) {
    return <SkeletonTable />;
  }
  if (query.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-light p-4">
        <p className="font-medium text-error-dark">Failed to load inbox.</p>
        <button
          type="button"
          className="mt-3 rounded-md border border-border-default bg-surface-page px-3 py-1.5 text-sm"
          onClick={() => void query.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No conversations yet"
        description="Messages from your customers will appear here."
      />
    );
  }

  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold">Inbox</h1>
      {rows.map((conversation) => (
        <ConversationRow key={conversation.id} conversation={conversation} />
      ))}
    </section>
  );
}
