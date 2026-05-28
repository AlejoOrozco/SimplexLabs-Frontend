'use client';

import { useAuth } from '@/context/auth-context';
import type { ConversationDetail } from '@/features/conversations/types';

export interface ConversationControlState {
  canReply: boolean;
  canTakeControl: boolean;
  canHandBack: boolean;
  isAgentMode: boolean;
  isControlledByMe: boolean;
  isControlledByOther: boolean;
  statusMessage: string;
}

export function useConversationControl(
  conversation: ConversationDetail | undefined,
): ConversationControlState {
  const { user, isSimplexAdmin, can } = useAuth();
  const canManage =
    can('company.conversations.manage') || can('company.conversations.take_control');

  if (!conversation) {
    return {
      canReply: false,
      canTakeControl: false,
      canHandBack: false,
      isAgentMode: true,
      isControlledByMe: false,
      isControlledByOther: false,
      statusMessage: '',
    };
  }

  const isAgentMode = conversation.controlMode === 'AGENT';
  const isControlledByMe =
    conversation.controlMode === 'HUMAN' && conversation.controlledByUserId === user?.id;
  const isControlledByOther =
    conversation.controlMode === 'HUMAN' &&
    conversation.controlledByUserId !== null &&
    conversation.controlledByUserId !== user?.id;

  const canReply = isSimplexAdmin || isControlledByMe;
  const canTakeControl = canManage && isAgentMode;
  const canHandBack = canManage && isControlledByMe;

  let statusMessage = 'Agent is handling this chat';
  if (isControlledByMe) {
    statusMessage = "You're replying manually";
  } else if (isControlledByOther) {
    statusMessage = 'In use by a teammate';
  } else if (isSimplexAdmin && isAgentMode) {
    statusMessage = 'Platform admin — you can reply without taking control';
  }

  return {
    canReply,
    canTakeControl,
    canHandBack,
    isAgentMode,
    isControlledByMe,
    isControlledByOther,
    statusMessage,
  };
}
