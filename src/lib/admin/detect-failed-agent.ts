import {
  AGENT_PIPELINE_ORDER,
  AgentPipelineStep,
  type AgentRun,
  type AgentRunStepRecord,
} from '@/lib/types/agent-pipeline-failure';

function normalizeStep(raw: string): AgentPipelineStep {
  const upper = raw.toUpperCase();
  for (const step of AGENT_PIPELINE_ORDER) {
    if (upper === step || upper.includes(step)) return step;
  }
  if (upper === AgentPipelineStep.UNKNOWN) return AgentPipelineStep.UNKNOWN;
  return AgentPipelineStep.UNKNOWN;
}

function stepHasFailure(record: AgentRunStepRecord): boolean {
  if (record.error != null && String(record.error).trim() !== '') return true;
  if (record.output === null || record.output === undefined) return true;
  return false;
}

function blockLooksFailed(block: unknown): boolean {
  if (!block || typeof block !== 'object' || Array.isArray(block)) return false;
  const obj = block as Record<string, unknown>;
  if (obj.error != null && String(obj.error).trim() !== '') return true;
  if (!('output' in obj)) return false;
  const out = obj.output;
  return out === null || out === undefined;
}

export function detectFailedAgent(task: AgentRun): AgentPipelineStep {
  if (task.failedStep) {
    const normalized = normalizeStep(task.failedStep);
    if (normalized !== AgentPipelineStep.UNKNOWN) return normalized;
  }

  if (task.steps?.length) {
    for (let i = task.steps.length - 1; i >= 0; i -= 1) {
      const s = task.steps[i];
      if (s && stepHasFailure(s)) {
        return normalizeStep(s.step);
      }
    }
  }

  const runs = task.agentRuns;
  if (runs && typeof runs === 'object' && !Array.isArray(runs)) {
    const record = runs as Record<string, unknown>;
    for (const key of AGENT_PIPELINE_ORDER) {
      const block = record[key];
      if (blockLooksFailed(block)) return key;
    }
  }

  return AgentPipelineStep.UNKNOWN;
}
