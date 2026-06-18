import { describe, expect, it } from 'vitest';

import { mapAiRouteError } from './api-error-map';
import {
  OLLAMA_TIMEOUT,
  OLLAMA_UPSTREAM,
  OllamaCallError,
} from './upstream-errors';

/**
 * Contract tests for JSON bodies returned by /api/chat and mapAiRouteError.
 * Rate-limit 429 is built inline in app/api/chat/route.ts — mirror keys/message there.
 */
describe('chat API public error JSON contracts', () => {
  it('504 Ollama timeout body (mapAiRouteError)', () => {
    const { status, body } = mapAiRouteError(
      new OllamaCallError('x', OLLAMA_TIMEOUT),
      'rid-timeout',
    );
    expect(status).toBe(504);
    expect(body).toMatchObject({
      requestId: 'rid-timeout',
      code: OLLAMA_TIMEOUT,
      error: expect.stringMatching(/too long/i),
      hint: expect.stringMatching(/Ollama/i),
    });
    expect(Object.keys(body).sort()).toEqual(['code', 'error', 'hint', 'requestId'].sort());
  });

  it('502 Ollama upstream body (mapAiRouteError)', () => {
    const { status, body } = mapAiRouteError(
      new OllamaCallError('upstream boom', OLLAMA_UPSTREAM, 500),
      'rid-upstream',
    );
    expect(status).toBe(502);
    expect(body).toMatchObject({
      requestId: 'rid-upstream',
      code: OLLAMA_UPSTREAM,
      error: expect.any(String),
      hint: expect.stringMatching(/ollama list/i),
    });
    expect(Object.keys(body).sort()).toEqual(['code', 'error', 'hint', 'requestId'].sort());
  });

  it('429 rate-limit body keys (sync with app/api/chat/route.ts)', () => {
    const body = {
      error: 'Too many chat requests. Please wait a moment and try again.',
      code: 'RATE_LIMIT' as const,
      requestId: 'rid-rl',
    };
    expect(body.code).toBe('RATE_LIMIT');
    expect(Object.keys(body).sort()).toEqual(['code', 'error', 'requestId'].sort());
  });
});
