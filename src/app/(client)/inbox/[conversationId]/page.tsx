'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { AgentRunInspector } from '@/features/conversations/components/agent-run-inspector';
import { MessageBubble } from '@/features/conversations/components/message-bubble';
import { TakeoverDialog } from '@/features/conversations/components/takeover-dialog';
import { useConversationThread } from '@/features/conversations/hooks/use-conversation-thread';
import { sendConversationMessage } from '@/features/conversations/api/conversations.api';
import { notify } from '@/lib/toast';

interface ThreadPageProps {
  params: { conversationId: string };
}

export default function ConversationThreadPage({ params }: ThreadPageProps): JSX.Element {
  const { conversationQuery, messagesQuery } = useConversationThread(params.conversationId);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return <SkeletonCard />;
  }
  if (conversationQuery.isError || messagesQuery.isError || !conversationQuery.data || !messagesQuery.data) {
    return (
      <div className="rounded-lg border border-error bg-error-light p-4">
        <p className="font-medium text-error-dark">Failed to load conversation.</p>
        <button
          type="button"
          className="mt-3 rounded-md border border-border-default bg-surface-page px-3 py-1.5 text-sm"
          onClick={() => {
            void conversationQuery.refetch();
            void messagesQuery.refetch();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const canReply = conversationQuery.data.controlMode === 'HUMAN';

  async function handleSend() {
    if (!canReply || content.trim().length === 0 || isSending) return;
    setIsSending(true);
    try {
      await notify.promise(sendConversationMessage(params.conversationId, content.trim()), {
        loading: 'Sending message...',
        success: 'Message sent',
        error: (error) => (error instanceof Error ? error.message : 'Failed to send message'),
      });
      setContent('');
      void messagesQuery.refetch();
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div className="rounded border p-3">
          <h1 className="font-semibold">Conversation thread</h1>
          <p className="text-xs text-slate-500">{conversationQuery.data.lifecycleStatus}</p>
        </div>
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto rounded border p-3">
          {messagesQuery.data.length === 0 ? (
            <EmptyState title="No messages yet" description="Send a message to start the thread." />
          ) : (
            messagesQuery.data.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
        </div>
        <div className="rounded border p-3">
          <textarea
            aria-label="Message composer"
            className="w-full rounded border p-2 text-sm"
            disabled={!canReply || isSending}
            maxLength={4096}
            onChange={(event) => setContent(event.target.value)}
            placeholder={
              canReply
                ? 'Type your message'
                : 'Agent is controlling this conversation. Take over to reply.'
            }
            value={content}
          />
          <button
            className="mt-2 rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
            disabled={!canReply || isSending}
            onClick={handleSend}
            type="button"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
        {!canReply && <TakeoverDialog conversationId={params.conversationId} />}
      </div>
      <AgentRunInspector conversationId={params.conversationId} />
    </section>
  );
}
