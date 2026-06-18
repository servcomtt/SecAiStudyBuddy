import 'server-only';

import { getChapterContext } from './chapter-context';
import type { ChapterSlug } from './course-data';
import {
  isAbortOrTimeoutError,
  OLLAMA_EMPTY,
  OLLAMA_STREAM_MALFORMED,
  OLLAMA_STREAM_TOO_LARGE,
  OLLAMA_TIMEOUT,
  OLLAMA_UPSTREAM,
  OllamaCallError,
} from './upstream-errors';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

type OllamaChatResponse = {
  model?: string;
  message?: {
    role?: string;
    content?: string;
  };
  done?: boolean;
  done_reason?: string;
  eval_count?: number;
  prompt_eval_count?: number;
};

type OllamaStreamChunk = OllamaChatResponse;
type OllamaTagsResponse = {
  models?: Array<{
    name?: string;
    model?: string;
  }>;
};

export type OllamaHealth = {
  available: boolean;
  baseUrl: string;
  model: string;
  modelInstalled: boolean;
  installedModels: string[];
  durationMs: number;
  error: string | null;
};

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3';

/** Upstream Ollama HTTP timeout (ms). */
const OLLAMA_FETCH_TIMEOUT_MS = Math.min(
  600_000,
  Math.max(5_000, parseInt(process.env.OLLAMA_TIMEOUT_MS ?? '60000', 10) || 60_000),
);

/** Stop forwarding SSE if encoded payload exceeds this (bytes). */
const OLLAMA_MAX_STREAM_OUT_BYTES = Math.min(
  16 * 1024 * 1024,
  Math.max(
    256 * 1024,
    parseInt(process.env.OLLAMA_MAX_STREAM_OUT_BYTES ?? `${2 * 1024 * 1024}`, 10) ||
      2 * 1024 * 1024,
  ),
);
const OLLAMA_SYSTEM_PROMPT =
  process.env.OLLAMA_SYSTEM_PROMPT ??
  [
    'You are Study Buddy, a CompTIA SecAI+ (exam CY0-001) tutor in the SecAIPlus web app.',
    'Only answer about SecAI+ domains and objectives, data analytics and governance ideas covered by the cert, practice-style questions in that scope, and exam study strategy for SecAI+.',
    'If the user asks anything not related to CompTIA SecAI+ study, reply in one or two short sentences that you only help with CompTIA SecAI+ and invite them to ask a SecAI+ topic—do not answer the off-topic request.',
    'For on-topic questions: keep answers concise, practical, and beginner-friendly; use short examples when they clarify the idea.',
  ].join(' ');

export const OLLAMA_QUIZ_SYSTEM_PROMPT =
  process.env.OLLAMA_QUIZ_SYSTEM_PROMPT ??
  [
    'You are Study Buddy, a CompTIA SecAI+ tutor. The learner just answered a practice question and already knows if they were right or wrong.',
    '',
    'Write a QUICK-LEARNING summary for fast exam prep (busy adults). Use this exact section layout in plain text:',
    '',
    'RIGHT ANSWER',
    '• 2–4 short bullets: why the keyed correct answer fits the question and scenario.',
    '',
    'WRONG TURNS',
    '• If the learner was incorrect: 1–3 bullets on why their choice is weaker or wrong. If they were correct: one line starting with "Nice —" that confirms the key and points to one idea to remember.',
    '',
    'MEMORY HOOK',
    '• One memorable phrase, analogy, or "think of it as…" (under 25 words).',
    '',
    'EXAM TIP',
    '• One line on how this concept appears on SecAI+ or common traps.',
    '',
    'Rules: When the user message includes a course or bank explanation, treat it as authoritative—align with it and never contradict it.',
    'Total about 160–280 words. Short bullets only; no long paragraphs. Simple vocabulary.',
  ].join('\n');

export type OllamaStreamOptions = {
  systemPromptOverride?: string;
  /** When aborted (e.g. client navigates away), stop talking to Ollama. */
  signal?: AbortSignal;
};

function mergeAbortWithTimeout(timeoutMs: number, external?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!external) return timeout;
  return AbortSignal.any([timeout, external]);
}

async function readOllamaFailureBody(response: Response): Promise<string> {
  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed) return `HTTP ${response.status}`;
  return trimmed.length > 500 ? `${trimmed.slice(0, 500)}…` : trimmed;
}

export function getOllamaConfig() {
  return {
    baseUrl: OLLAMA_BASE_URL.replace(/\/$/, ''),
    model: OLLAMA_MODEL,
    systemPrompt: OLLAMA_SYSTEM_PROMPT,
  };
}

export async function getOllamaHealth(): Promise<OllamaHealth> {
  const { baseUrl, model } = getOllamaConfig();
  const startedAt = performance.now();

  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3_000),
    });

    if (!response.ok) {
      return {
        available: false,
        baseUrl,
        model,
        modelInstalled: false,
        installedModels: [],
        durationMs: Math.round((performance.now() - startedAt) * 10) / 10,
        error: `Ollama tags request failed (${response.status}).`,
      };
    }

    const payload = (await response.json()) as OllamaTagsResponse;
    const installedModels = (payload.models ?? [])
      .map((entry) => entry.name ?? entry.model ?? '')
      .map((entry) => entry.trim())
      .filter(Boolean);

    return {
      available: true,
      baseUrl,
      model,
      modelInstalled: installedModels.some((entry) => entry === model || entry.startsWith(`${model}:`)),
      installedModels,
      durationMs: Math.round((performance.now() - startedAt) * 10) / 10,
      error: null,
    };
  } catch (error) {
    return {
      available: false,
      baseUrl,
      model,
      modelInstalled: false,
      installedModels: [],
      durationMs: Math.round((performance.now() - startedAt) * 10) / 10,
      error: error instanceof Error ? error.message : 'Unable to reach Ollama.',
    };
  }
}

async function buildPromptMessages(
  messages: ChatMessage[],
  chapterSlug?: ChapterSlug | null,
  options?: Pick<OllamaStreamOptions, 'systemPromptOverride'>,
) {
  const { baseUrl, model, systemPrompt } = getOllamaConfig();
  const system = options?.systemPromptOverride ?? systemPrompt;
  const trimmedMessages = messages
    .filter((message) => (message.role === 'user' || message.role === 'assistant') && message.content.trim())
    .slice(-12);

  const chapterContext = chapterSlug ? await getChapterContext(chapterSlug) : null;

  return {
    baseUrl,
    model,
    payloadMessages: [
      { role: 'system', content: system },
      ...(chapterContext
        ? [{
            role: 'system',
            content: `Use the following study context when it is relevant to the user question.\n\n${chapterContext}`,
          }]
        : []),
      ...trimmedMessages,
    ],
    chapterContext,
  };
}

export async function requestOllamaChat(
  messages: ChatMessage[],
  chapterSlug?: ChapterSlug | null,
  options?: OllamaStreamOptions,
) {
  const { baseUrl, model, payloadMessages } = await buildPromptMessages(
    messages,
    chapterSlug,
    options,
  );
  const startedAt = performance.now();

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: mergeAbortWithTimeout(OLLAMA_FETCH_TIMEOUT_MS, options?.signal),
      body: JSON.stringify({
        model,
        stream: false,
        messages: payloadMessages,
      }),
    });
  } catch (error) {
    if (isAbortOrTimeoutError(error)) {
      throw new OllamaCallError('Ollama request timed out.', OLLAMA_TIMEOUT);
    }
    throw new OllamaCallError(
      error instanceof Error ? error.message : 'Ollama request failed.',
      OLLAMA_UPSTREAM,
    );
  }

  if (!response.ok) {
    const detail = await readOllamaFailureBody(response);
    throw new OllamaCallError(
      `Ollama request failed (${response.status}): ${detail}`,
      OLLAMA_UPSTREAM,
      response.status,
    );
  }

  let payload: OllamaChatResponse;
  try {
    payload = (await response.json()) as OllamaChatResponse;
  } catch {
    throw new OllamaCallError('Ollama returned invalid JSON.', OLLAMA_UPSTREAM);
  }

  const content = payload.message?.content?.trim();

  if (!content) {
    throw new OllamaCallError('Ollama returned an empty assistant message.', OLLAMA_EMPTY);
  }

  return {
    model: payload.model ?? model,
    content,
    promptTokens: payload.prompt_eval_count ?? null,
    responseTokens: payload.eval_count ?? null,
    doneReason: payload.done_reason ?? null,
    upstreamMs: Math.round((performance.now() - startedAt) * 10) / 10,
  };
}

function encodeSse(event: string, data: Record<string, unknown>) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function streamOllamaChat(
  messages: ChatMessage[],
  chapterSlug?: ChapterSlug | null,
  options?: OllamaStreamOptions,
) {
  const { baseUrl, model } = getOllamaConfig();
  const combinedSignal = mergeAbortWithTimeout(OLLAMA_FETCH_TIMEOUT_MS, options?.signal);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let outBytes = 0;
      let closed = false;
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
      let buffer = '';

      const closeSafe = () => {
        if (!closed) {
          closed = true;
          controller.close();
        }
      };

      const enqueueSafe = (chunk: Uint8Array) => {
        outBytes += chunk.byteLength;
        if (outBytes > OLLAMA_MAX_STREAM_OUT_BYTES) {
          throw new OllamaCallError('Stream exceeded size guard.', OLLAMA_STREAM_TOO_LARGE);
        }
        controller.enqueue(chunk);
      };

      const emitError = (message: string, code: string | null) => {
        enqueueSafe(
          encoder.encode(
            encodeSse('error', {
              message,
              code,
            }),
          ),
        );
      };

      const parseLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        let payload: OllamaStreamChunk;
        try {
          payload = JSON.parse(trimmed) as OllamaStreamChunk;
        } catch {
          throw new OllamaCallError('Invalid JSON line in Ollama stream.', OLLAMA_STREAM_MALFORMED);
        }

        const text = payload.message?.content ?? '';

        if (text) {
          enqueueSafe(encoder.encode(encodeSse('chunk', { text })));
        }

        if (payload.done) {
          enqueueSafe(
            encoder.encode(
              encodeSse('done', {
                model: payload.model ?? model,
                promptTokens: payload.prompt_eval_count ?? null,
                responseTokens: payload.eval_count ?? null,
                doneReason: payload.done_reason ?? null,
              }),
            ),
          );
        }
      };

      try {
        enqueueSafe(
          encoder.encode(
            encodeSse('meta', {
              model,
              chapterSlug: chapterSlug ?? null,
              hasChapterContext: Boolean(chapterSlug),
              phase: 'opening',
            }),
          ),
        );

        const { payloadMessages, chapterContext } = await buildPromptMessages(
          messages,
          chapterSlug,
          options,
        );

        enqueueSafe(
          encoder.encode(
            encodeSse('meta', {
              model,
              chapterSlug: chapterSlug ?? null,
              hasChapterContext: Boolean(chapterContext),
              phase: 'requesting-upstream',
            }),
          ),
        );

        let response: Response;
        try {
          response = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
            signal: combinedSignal,
            body: JSON.stringify({
              model,
              stream: true,
              messages: payloadMessages,
            }),
          });
        } catch (error) {
          if (isAbortOrTimeoutError(error)) {
            emitError('Ollama stream timed out.', OLLAMA_TIMEOUT);
            return;
          }
          emitError(
            error instanceof Error ? error.message : 'Ollama stream request failed.',
            OLLAMA_UPSTREAM,
          );
          return;
        }

        if (!response.ok) {
          const detail = await readOllamaFailureBody(response);
          emitError(`Ollama request failed (${response.status}): ${detail}`, OLLAMA_UPSTREAM);
          return;
        }

        if (!response.body) {
          emitError('Ollama did not return a readable stream.', OLLAMA_UPSTREAM);
          return;
        }

        reader = response.body.getReader();

        while (true) {
          if (combinedSignal.aborted) {
            await reader.cancel().catch(() => {});
            break;
          }

          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            parseLine(line);
          }
        }

        if (buffer.trim()) {
          parseLine(buffer.trim());
        }
      } catch (error) {
        const code =
          error instanceof OllamaCallError ? error.code : OLLAMA_STREAM_MALFORMED;
        const message =
          error instanceof OllamaCallError
            ? error.code === OLLAMA_STREAM_TOO_LARGE
              ? 'The AI reply exceeded the maximum stream size.'
              : error.message
            : error instanceof Error
              ? error.message
              : 'Streaming response interrupted.';
        try {
          emitError(message, code);
        } catch {
          /* controller may already be errored */
        }
      } finally {
        reader?.releaseLock();
        closeSafe();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
