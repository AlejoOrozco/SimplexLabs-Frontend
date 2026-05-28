'use client';

import Link from 'next/link';
import { PageMeta } from '@/components/layout/page-meta';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { AgentRunInspector } from '@/features/conversations/components/agent-run-inspector';
import { MessageBubble } from '@/features/conversations/components/message-bubble';
import { useConversationThread } from '@/features/conversations/hooks/use-conversation-thread';
import { getConversationStatusLabel } from '@/features/conversations/utils/conversation-display';
import { adminCompanyWorkspaceHref } from '@/lib/admin/admin-company-workspace-href';

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
      <div className="rounded-lg border border-error bg-error-surface p-4">
        <p className="font-medium text-error-dark">Failed to load conversation.</p>
      </div>
    );
  }

  if (conversationQuery.data.companyId !== companyId) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4">
        <p className="font-medium text-error-dark">This conversation does not belong to the selected company.</p>
        <Link href={adminCompanyWorkspaceHref(companyId, 'conversations')} className="mt-2 inline-block text-sm underline">
          Back to conversations
        </Link>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <PageMeta
        title="Conversation thread"
        description={`Status: ${getConversationStatusLabel(conversationQuery.data)}`}
      />
      <div className="space-y-4">
        <div className="rounded-lg border border-border-focus bg-surface-raised px-4 py-3 text-sm text-text-primary shadow-brand">
          <span className="font-semibold">Read only</span>
          <span className="text-text-secondary"> — Composer and takeover are hidden in the admin view.</span>
        </div>
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto rounded-lg border border-border-default bg-surface-base p-3">
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
