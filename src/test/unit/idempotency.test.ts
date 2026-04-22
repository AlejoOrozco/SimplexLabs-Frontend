import { describe, expect, it } from 'vitest';
import { createIdempotencyKey } from '@/lib/api/idempotency';

describe('createIdempotencyKey', () => {
  it('creates unique UUID values', () => {
    const first = createIdempotencyKey();
    const second = createIdempotencyKey();

    expect(first).not.toBe(second);
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
