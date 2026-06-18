import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mapAiRouteError } from './api-error-map';
import {
  OLLAMA_EMPTY,
  OLLAMA_STREAM_MALFORMED,
  OLLAMA_STREAM_TOO_LARGE,
  OLLAMA_TIMEOUT,
  OLLAMA_UPSTREAM,
  OllamaCallError,
} from './upstream-errors';

describe('mapAiRouteError', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('maps timeout to 504', () => {
    const { status, body } = mapAiRouteError(
      new OllamaCallError('x', OLLAMA_TIMEOUT),
      'rid-1',
    );
    expect(status).toBe(504);
    expect(body.code).toBe(OLLAMA_TIMEOUT);
    expect(body.requestId).toBe('rid-1');
    expect(body.error).toMatch(/too long/i);
  });

  it('maps stream too large to 502', () => {
    const { status, body } = mapAiRouteError(
      new OllamaCallError('x', OLLAMA_STREAM_TOO_LARGE),
      'rid-2',
    );
    expect(status).toBe(502);
    expect(body.code).toBe(OLLAMA_STREAM_TOO_LARGE);
  });

  it('maps malformed stream to 502', () => {
    const { status, body } = mapAiRouteError(
      new OllamaCallError('x', OLLAMA_STREAM_MALFORMED),
      'rid-3',
    );
    expect(status).toBe(502);
    expect(body.code).toBe(OLLAMA_STREAM_MALFORMED);
  });

  it('maps empty response to 502', () => {
    const { status, body } = mapAiRouteError(new OllamaCallError('x', OLLAMA_EMPTY), 'rid-4');
    expect(status).toBe(502);
    expect(body.code).toBe(OLLAMA_EMPTY);
  });

  it('truncates long upstream messages in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const long = 'x'.repeat(400);
    const { body } = mapAiRouteError(new OllamaCallError(long, OLLAMA_UPSTREAM, 500), 'rid-5');
    expect(body.error.length).toBeLessThan(long.length);
  });

  it('maps unknown errors to 502', () => {
    const { status, body } = mapAiRouteError(new Error('weird'), 'rid-6');
    expect(status).toBe(502);
    expect(body.requestId).toBe('rid-6');
  });
});
