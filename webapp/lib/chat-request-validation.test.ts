import { describe, expect, it } from 'vitest';

import {
  MAX_CHAT_JSON_BYTES,
  parseChatJsonRaw,
  validateChatPostBody,
} from './chat-request-validation';

const isSlug = (v: unknown): v is string => v === 'data-mining' || v === 'general-test';

describe('parseChatJsonRaw', () => {
  it('rejects oversized body', () => {
    const huge = 'x'.repeat(MAX_CHAT_JSON_BYTES + 1);
    const r = parseChatJsonRaw(huge);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(413);
  });

  it('rejects invalid JSON', () => {
    const r = parseChatJsonRaw('{');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('parses valid JSON', () => {
    const r = parseChatJsonRaw('{"a":1}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ a: 1 });
  });
});

describe('validateChatPostBody', () => {
  it('requires a user message with non-whitespace content', () => {
    expect(
      validateChatPostBody({ messages: [{ role: 'assistant', content: 'hi' }] }, isSlug).ok,
    ).toBe(false);
    expect(
      validateChatPostBody({ messages: [{ role: 'user', content: '   ' }] }, isSlug).ok,
    ).toBe(false);
    const ok = validateChatPostBody({ messages: [{ role: 'user', content: 'Hello' }] }, isSlug);
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.messages).toHaveLength(1);
  });

  it('rejects invalid chapterSlug when present', () => {
    const r = validateChatPostBody(
      { messages: [{ role: 'user', content: 'x' }], chapterSlug: 'nope' },
      isSlug,
    );
    expect(r.ok).toBe(false);
  });

  it('accepts valid chapterSlug', () => {
    const r = validateChatPostBody(
      { messages: [{ role: 'user', content: 'x' }], chapterSlug: 'data-mining' },
      isSlug,
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.chapterSlug).toBe('data-mining');
  });

  it('defaults stream true', () => {
    const r = validateChatPostBody({ messages: [{ role: 'user', content: 'x' }] }, isSlug);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.stream).toBe(true);
  });

  it('honors stream false', () => {
    const r = validateChatPostBody(
      { messages: [{ role: 'user', content: 'x' }], stream: false },
      isSlug,
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.stream).toBe(false);
  });
});
