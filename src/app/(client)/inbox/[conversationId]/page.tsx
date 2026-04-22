'use client';

import { useState } from 'react';
import { AgentRunInspector } from '@/features/conversations/components/agent-run-inspector';
import { MessageBubble } from '@/features/conversations/components/message-bubble';
import { TakeoverDialog } from '@/features/conversations/components/takeover-dialog';
import { useConversationThread } from '@/features/conversations/hooks/use-conversation-thread';
import { sendConversationMessage } from '@/features/conversations/api/conversations.api';

interface ThreadPageProps {
  params: { conversationId: string };
}

export default function ConversationThreadPage({ params }: ThreadPageProps): JSX.Element {
  const { conversationQuery, messagesQuery } = useConversationThread(params.conversationId);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return <div className="animate-pulse rounded border p-4">Loading conversation...</div>;
  }
  if (conversationQuery.isError || messagesQuery.isError || !conversationQuery.data || !messagesQuery.data) {
    return <div className="rounded border border-red-200 bg-red-50 p-4">Failed to load conversation.</div>;
  }

  const canReply = conversationQuery.data.controlMode === 'HUMAN';

  async function handleSend() {
    if (!canReply || content.trim().length === 0 || isSending) return;
    setIsSending(true);
    try {
      await sendConversationMessage(params.conversationId, content.trim());
      setContent('');
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
          {messagesQuery.data.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
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
