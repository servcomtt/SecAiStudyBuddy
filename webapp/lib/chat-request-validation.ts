/** Matches ollama.ts ChatMessage shape without importing server-only module into tests. */
export type ValidatedChatMessage = { role: 'user' | 'assistant'; content: string };

/** Total JSON body size limit for /api/chat POST (bytes). */
export const MAX_CHAT_JSON_BYTES = 256 * 1024;

/** Max characters per message content (after trim check on trimmed slice). */
export const MAX_MESSAGE_CONTENT_CHARS = 16_000;

/** Max chat turns accepted (user + assistant); server also slices in ollama.ts. */
export const MAX_CHAT_MESSAGES = 24;

export type ChatPostValidation =
  | { ok: true; messages: ValidatedChatMessage[]; chapterSlug: string | null; stream: boolean }
  | { ok: false; status: 400 | 413; error: string };

export function parseChatJsonRaw(
  raw: string,
): { ok: true; value: unknown } | { ok: false; status: 400 | 413; error: string } {
  if (raw.length > MAX_CHAT_JSON_BYTES) {
    return { ok: false, status: 413, error: 'Request body too large.' };
  }
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON body.' };
  }
}

function isChatMessageRecord(value: unknown): value is ValidatedChatMessage {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  if (o.role !== 'user' && o.role !== 'assistant') return false;
  if (typeof o.content !== 'string') return false;
  return true;
}

/**
 * Validates /api/chat POST body: non-empty user content, size limits, optional chapter slug key.
 */
export function validateChatPostBody(
  body: unknown,
  isChapterSlug: (v: unknown) => v is string,
): ChatPostValidation {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, error: 'Expected a JSON object.' };
  }

  const o = body as Record<string, unknown>;
  const stream = o.stream === false ? false : true;

  const chapterSlug =
    o.chapterSlug === null || o.chapterSlug === undefined
      ? null
      : isChapterSlug(o.chapterSlug)
        ? o.chapterSlug
        : null;

  if (o.chapterSlug != null && chapterSlug === null) {
    return { ok: false, status: 400, error: 'Invalid chapterSlug.' };
  }

  if (!Array.isArray(o.messages)) {
    return { ok: false, status: 400, error: 'messages must be an array.' };
  }

  if (o.messages.length > MAX_CHAT_MESSAGES) {
    return { ok: false, status: 400, error: `At most ${MAX_CHAT_MESSAGES} messages allowed.` };
  }

  const messages: ValidatedChatMessage[] = [];
  for (const entry of o.messages) {
    if (!isChatMessageRecord(entry)) {
      return { ok: false, status: 400, error: 'Each message needs role user|assistant and string content.' };
    }
    if (entry.content.length > MAX_MESSAGE_CONTENT_CHARS) {
      return {
        ok: false,
        status: 400,
        error: `Message content exceeds ${MAX_MESSAGE_CONTENT_CHARS} characters.`,
      };
    }
    messages.push({ role: entry.role, content: entry.content });
  }

  const trimmed = messages.filter(
    (m) => (m.role === 'user' || m.role === 'assistant') && m.content.trim().length > 0,
  );

  const hasUser = trimmed.some((m) => m.role === 'user');
  if (!hasUser) {
    return { ok: false, status: 400, error: 'Send at least one user message with non-empty content.' };
  }

  return { ok: true, messages: trimmed, chapterSlug, stream };
}
