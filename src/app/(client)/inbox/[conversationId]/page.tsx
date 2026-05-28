'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { AgentRunInspector } from '@/features/conversations/components/agent-run-inspector';
import { ConversationControlBanner } from '@/features/conversations/components/conversation-control-banner';
import { MessageBubble } from '@/features/conversations/components/message-bubble';
import { TakeoverDialog } from '@/features/conversations/components/takeover-dialog';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useConversationControl } from '@/features/conversations/hooks/use-conversation-control';
import { useConversationThread } from '@/features/conversations/hooks/use-conversation-thread';
import { useHandback } from '@/features/conversations/hooks/use-handback';
import { useSendMessage } from '@/features/conversations/hooks/use-send-message';
import { PageMeta } from '@/components/layout/page-meta';
import { getConversationStatusLabel } from '@/features/conversations/utils/conversation-display';
import { notify } from '@/lib/toast';

interface ThreadPageProps {
  params: { conversationId: string };
}

export default function ConversationThreadPage({ params }: ThreadPageProps): JSX.Element {
  const { conversationQuery, messagesQuery } = useConversationThread(params.conversationId);
  const control = useConversationControl(conversationQuery.data);
  const handback = useHandback(params.conversationId);
  const sendMessage = useSendMessage(params.conversationId);
  const [content, setContent] = useState('');

  const inboxGate = (
    <PermissionGate
      permission="company.conversations.view"
      permissions={['company.conversations.manage', 'company.conversations.take_control']}
      fallback={
        <div className="rounded-lg border border-border-default p-6 text-sm text-text-secondary">
          You do not have permission to view this conversation.
        </div>
      }
    >
      {renderThread()}
    </PermissionGate>
  );

  function renderThread(): JSX.Element {
    if (conversationQuery.isLoading || messagesQuery.isLoading) {
      return <SkeletonCard />;
    }
    if (
      conversationQuery.isError ||
      messagesQuery.isError ||
      !conversationQuery.data ||
      !messagesQuery.data
    ) {
      return (
        <div className="rounded-lg border border-error bg-error-surface p-4">
          <p className="font-medium text-error-dark">Failed to load conversation.</p>
          <button
            type="button"
            className="mt-3 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-sm"
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

    const conversation = conversationQuery.data;
    const hasPhone = Boolean(conversation.contact.phone);
    const composerDisabled =
      !control.canReply || sendMessage.isPending || handback.isPending || !hasPhone;

    async function handleSend(): Promise<void> {
      if (composerDisabled || content.trim().length === 0) return;
      try {
        await notify.promise(sendMessage.mutateAsync(content.trim()), {
          loading: 'Sending message…',
          success: 'Message sent',
          error: (error) => (error instanceof Error ? error.message : 'Failed to send message'),
        });
        setContent('');
      } catch {
        // Toast handled by notify.promise
      }
    }

    return (
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <PageMeta
          title="Conversation"
          description={`Status: ${getConversationStatusLabel(conversation)}`}
        />
        <div className="space-y-4">
          <ConversationControlBanner
            message={control.statusMessage}
            variant={control.isControlledByOther ? 'warning' : 'info'}
          />

          <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto rounded border p-3">
            {messagesQuery.data.length === 0 ? (
              <EmptyState title="No messages yet" description="Messages will appear here." />
            ) : (
              messagesQuery.data.map((message) => <MessageBubble key={message.id} message={message} />)
            )}
          </div>

          {!hasPhone ? (
            <p className="text-sm text-amber-800">
              This contact has no phone number — WhatsApp replies are unavailable.
            </p>
          ) : null}

          <PermissionGate
            permission="company.conversations.manage"
            permissions={['company.conversations.take_control']}
          >
            <div className="rounded border p-3">
              <textarea
                aria-label="Message composer"
                className="w-full rounded border p-2 text-sm"
                disabled={composerDisabled}
                maxLength={4096}
                onChange={(event) => setContent(event.target.value)}
                placeholder={
                  control.canReply
                    ? 'Type your message'
                    : control.isControlledByOther
                      ? 'Another teammate is replying'
                      : 'Take control to reply manually'
                }
                value={content}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
                  disabled={composerDisabled}
                  onClick={() => void handleSend()}
                  type="button"
                >
                  {sendMessage.isPending ? 'Sending…' : 'Send'}
                </button>
                {control.canHandBack ? (
                  <button
                    className="rounded border px-3 py-2 text-sm disabled:opacity-60"
                    disabled={handback.isPending || sendMessage.isPending}
                    onClick={() => handback.mutate()}
                    type="button"
                  >
                    {handback.isPending ? 'Handing back…' : 'Hand back to agent'}
                  </button>
                ) : null}
              </div>
            </div>
          </PermissionGate>

          {control.canTakeControl ? (
            <PermissionGate
              permission="company.conversations.manage"
              permissions={['company.conversations.take_control']}
            >
              <TakeoverDialog conversationId={params.conversationId} />
            </PermissionGate>
          ) : null}
        </div>
        <AgentRunInspector conversationId={params.conversationId} />
      </section>
    );
  }

  return inboxGate;
}
