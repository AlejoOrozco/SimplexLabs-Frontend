'use client';

import Link from 'next/link';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { AgentRunInspector } from '@/features/conversations/components/agent-run-inspector';
import { MessageBubble } from '@/features/conversations/components/message-bubble';
import { useConversationThread } from '@/features/conversations/hooks/use-conversation-thread';

interface ReadOnlyConversationViewProps {
  companyId: string;
  conversationId: string;
}

export function ReadOnlyConversationView({
  companyId,
  conversationId,
}: ReadOnlyConversationViewProps): JSX.Element {
  const { conversationQuery, messagesQuery } = useConversationThread(conversationId);

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return <SkeletonCard />;
  }

  if (conversationQuery.isError || messagesQuery.isError || !conversationQuery.data || !messagesQuery.data) {
    return (
      <div className="rounded-lg border border-error bg-error-light p-4">
        <p className="font-medium text-error-dark">Failed to load conversation.</p>
      </div>
    );
  }

  if (conversationQuery.data.companyId !== companyId) {
    return (
      <div className="rounded-lg border border-error bg-error-light p-4">
        <p className="font-medium text-error-dark">This conversation does not belong to the selected company.</p>
        <Link href={`/admin/clients/${companyId}?tab=conversations`} className="mt-2 inline-block text-sm underline">
          Back to conversations
        </Link>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-text-primary">
          <span className="font-semibold">Read only</span>
          <span className="text-text-secondary"> — Composer and takeover are hidden in the admin view.</span>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-3">
          <h1 className="font-semibold text-text-primary">Conversation thread</h1>
          <p className="text-xs text-text-secondary">{conversationQuery.data.lifecycleStatus}</p>
        </div>
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto rounded-lg border border-border-default bg-surface-page p-3">
          {messagesQuery.data.length === 0 ? (
            <EmptyState title="No messages yet" description="No messages in this thread." />
          ) : (
            messagesQuery.data.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
        </div>
      </div>
      <AgentRunInspector conversationId={conversationId} />
    </section>
  );
}
