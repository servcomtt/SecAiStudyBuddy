import { describe, expect, it } from 'vitest';

import { checkMemoryRateLimit } from './rate-limit-memory';

describe('checkMemoryRateLimit', () => {
  it('allows requests under the cap', () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      expect(checkMemoryRateLimit(key, 5, 60_000)).toEqual({ ok: true });
    }
  });

  it('blocks after max in the same window', () => {
    const key = `t-${Math.random()}`;
    expect(checkMemoryRateLimit(key, 2, 60_000)).toEqual({ ok: true });
    expect(checkMemoryRateLimit(key, 2, 60_000)).toEqual({ ok: true });
    const blocked = checkMemoryRateLimit(key, 2, 60_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});
