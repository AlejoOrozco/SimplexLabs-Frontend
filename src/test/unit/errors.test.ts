import { describe, expect, it } from 'vitest';
import { normalizeApiError } from '@/lib/api/errors';

describe('normalizeApiError', () => {
  it('maps validation fields', () => {
    const error = normalizeApiError(
      {
        statusCode: 400,
        code: 'validation_failed',
        message: ['content must not be empty'],
        error: 'Bad Request',
        path: '/api/v1/conversations',
        timestamp: new Date().toISOString(),
        correlationId: 'corr_12345678',
      },
      null,
    );

    expect(error.code).toBe('validation_failed');
    expect(error.fields?.content).toContain('must not be empty');
  });

  it('reads retry-after header for rate limits', () => {
    const error = normalizeApiError(
      {
        statusCode: 429,
        code: 'rate_limited',
        message: 'Too many requests',
        error: 'Too Many Requests',
        path: '/api/v1/conversations',
        timestamp: new Date().toISOString(),
        correlationId: 'corr_12345678',
      },
      '4',
    );

    expect(error.retryAfterMs).toBe(4_000);
  });
});
