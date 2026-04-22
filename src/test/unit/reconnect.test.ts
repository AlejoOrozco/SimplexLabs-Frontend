import { describe, expect, it } from 'vitest';
import { shouldShowReconnectPill } from '@/lib/realtime/reconnect';

describe('shouldShowReconnectPill', () => {
  it('returns false when no disconnection recorded', () => {
    expect(shouldShowReconnectPill(null)).toBe(false);
  });

  it('returns true after threshold', () => {
    const now = Date.now;
    Date.now = () => 10_000;
    expect(shouldShowReconnectPill(5_000)).toBe(true);
    Date.now = now;
  });
});
