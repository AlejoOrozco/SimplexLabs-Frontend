interface AgentRunInspectorProps {
  conversationId: string;
}

export function AgentRunInspector({ conversationId }: AgentRunInspectorProps): JSX.Element {
  return (
    <aside className="rounded-lg border p-3">
      <h3 className="font-medium">Agent run inspector</h3>
      <p className="mt-2 text-xs text-slate-500">
        Conversation {conversationId}. Analyzer/Retriever/Decider/Executor/Responder views are wired with
        typed placeholders until final backend payload confirmation.
      </p>
      {/* TODO: confirm with backend - add typed AgentRun step schemas and payload mappers (ticket: FE-AGENT-RUN-SCHEMA) */}
    </aside>
  );
}
