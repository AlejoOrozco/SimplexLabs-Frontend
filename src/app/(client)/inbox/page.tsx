'use client';

import { useMemo } from 'react';
import { ConversationRow } from '@/features/conversations/components/conversation-row';
import { useConversationList } from '@/features/conversations/hooks/use-conversation-list';

export default function InboxPage(): JSX.Element {
  const query = useConversationList();

  const rows = useMemo(
    () => query.data?.pages.flatMap((page) => page) ?? [],
    [query.data],
  );

  if (query.isLoading) {
    return <div className="animate-pulse rounded border p-4">Loading inbox...</div>;
  }
  if (query.isError) {
    return <div className="rounded border border-red-200 bg-red-50 p-4">Failed to load inbox.</div>;
  }
  if (rows.length === 0) {
    return <div className="rounded border p-4">No conversations yet.</div>;
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
