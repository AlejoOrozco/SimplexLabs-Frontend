import { z } from 'zod';

export const apiErrorCodeSchema = z.enum([
  'validation_failed',
  'bad_request',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'payload_too_large',
  'rate_limited',
  'illegal_state',
  'internal',
]);

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export type ApiFieldErrors = Record<string, string>;

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly correlationId: string;
  public readonly fields?: ApiFieldErrors;
  public readonly retryAfterMs?: number;

  public constructor(params: {
    message: string;
    code: ApiErrorCode;
    statusCode: number;
    correlationId: string;
    fields?: ApiFieldErrors;
    retryAfterMs?: number;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.correlationId = params.correlationId;
    this.fields = params.fields;
    this.retryAfterMs = params.retryAfterMs;
  }
}

export const errorEnvelopeSchema = z.object({
  statusCode: z.number().int(),
  code: apiErrorCodeSchema,
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string(),
  path: z.string(),
  timestamp: z.string(),
  correlationId: z.string(),
});

function parseFieldErrors(messages: string[]): ApiFieldErrors | undefined {
  const fields: ApiFieldErrors = {};
  for (const message of messages) {
    const [rawKey, ...rest] = message.split(' ');
    if (!rawKey) continue;
    const key = rawKey.trim();
    const detail = rest.join(' ').trim();
    if (key.length === 0 || detail.length === 0) continue;
    if (!fields[key]) fields[key] = detail;
  }
  return Object.keys(fields).length > 0 ? fields : undefined;
}

export function normalizeApiError(input: unknown, retryAfterHeader: string | null): ApiError {
  const parsed = errorEnvelopeSchema.safeParse(input);
  if (!parsed.success) {
    return new ApiError({
      message: 'Malformed error response',
      code: 'bad_request',
      statusCode: 400,
      correlationId: crypto.randomUUID(),
    });
  }

  const raw = parsed.data;
  const rawMessage = Array.isArray(raw.message) ? raw.message.join(', ') : raw.message;
  const fields = Array.isArray(raw.message) && raw.code === 'validation_failed'
    ? parseFieldErrors(raw.message)
    : undefined;
  const retryAfterMs = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) * 1_000 : undefined;

  return new ApiError({
    message: rawMessage,
    code: raw.code,
    statusCode: raw.statusCode,
    correlationId: raw.correlationId,
    fields,
    retryAfterMs: Number.isFinite(retryAfterMs ?? Number.NaN) ? retryAfterMs : undefined,
  });
}
