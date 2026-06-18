import { describe, expect, it } from 'vitest';

import { toFriendlyAiErrorMessage } from './user-facing-error';

describe('toFriendlyAiErrorMessage', () => {
  it('maps timeout-ish text', () => {
    expect(toFriendlyAiErrorMessage('TimeoutError')).toMatch(/too long/i);
  });

  it('preserves rate limit copy', () => {
    expect(toFriendlyAiErrorMessage('Too many chat requests.')).toContain('Too many');
  });

  it('shortens very long unknown errors', () => {
    const msg = 'x'.repeat(400);
    expect(toFriendlyAiErrorMessage(msg).length).toBeLessThan(msg.length);
  });
});
