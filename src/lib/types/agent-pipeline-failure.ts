/** Stages in the agent pipeline (ordering matters for diagnosis). */
export const AgentPipelineStep = {
  ANALYZER: 'ANALYZER',
  CONTEXT_BUILDER: 'CONTEXT_BUILDER',
  DECISION_MAKER: 'DECISION_MAKER',
  ACTION_EXECUTOR: 'ACTION_EXECUTOR',
  RESPONDER: 'RESPONDER',
  UNKNOWN: 'UNKNOWN',
} as const;
export type AgentPipelineStep = (typeof AgentPipelineStep)[keyof typeof AgentPipelineStep];

export const AGENT_PIPELINE_ORDER: readonly Exclude<AgentPipelineStep, 'UNKNOWN'>[] = [
  AgentPipelineStep.ANALYZER,
  AgentPipelineStep.CONTEXT_BUILDER,
  AgentPipelineStep.DECISION_MAKER,
  AgentPipelineStep.ACTION_EXECUTOR,
  AgentPipelineStep.RESPONDER,
];

export interface AgentRunStepRecord {
  step: string;
  input?: unknown;
  output?: unknown;
  error?: string | null;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentRunConversationRef {
  id: string;
  companyId: string;
  company: {
    id: string;
    name: string;
  };
}

export interface AgentRunMessageRef {
  id: string;
  content: string;
}

/**
 * One failed agent execution row from the admin DLQ API.
 * `agentRuns` holds the full trace JSON; `steps` may duplicate it in a typed list.
 */
export interface AgentRun {
  id: string;
  createdAt: string;
  updatedAt?: string;
  error?: string | null;
  /** Optional explicit stage when the API already computed it. */
  failedStep?: string | null;
  conversation: AgentRunConversationRef;
  message: AgentRunMessageRef;
  steps?: AgentRunStepRecord[];
  /** Raw pipeline payload (inputs/outputs per agent). */
  agentRuns?: unknown;
}
