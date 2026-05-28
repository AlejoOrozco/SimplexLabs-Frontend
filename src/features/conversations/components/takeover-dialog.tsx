'use client';

import { useState } from 'react';
import { useTakeover } from '@/features/conversations/hooks/use-takeover';

export function TakeoverDialog({ conversationId }: { conversationId: string }): JSX.Element {
  const takeover = useTakeover(conversationId);
  const [reason, setReason] = useState('');

  return (
    <div className="rounded-lg border p-3">
      <p className="mb-2 text-sm text-slate-600">
        Take control to reply manually on WhatsApp. The AI agent will pause until you hand back.
      </p>
      <label className="mb-2 block text-sm font-medium" htmlFor="takeover-reason">
        Reason (optional)
      </label>
      <textarea
        id="takeover-reason"
        className="w-full rounded border p-2 text-sm"
        maxLength={200}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <button
        className="mt-3 rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
        disabled={takeover.isPending}
        onClick={() => takeover.mutate(reason || undefined)}
        type="button"
      >
        {takeover.isPending ? 'Taking control…' : 'Take control'}
      </button>
    </div>
  );
}
