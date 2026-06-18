import { NextRequest, NextResponse } from 'next/server';

import { mapAiRouteError } from '../../../lib/api-error-map';
import { logRouteError, getClientIp, getOrCreateRequestId } from '../../../lib/api-request';
import { parseChatJsonRaw, validateChatPostBody } from '../../../lib/chat-request-validation';
import { chapters, type ChapterSlug } from '../../../lib/course-data';
import { checkMemoryRateLimit } from '../../../lib/rate-limit-memory';
import {
  getOllamaHealth,
  requestOllamaChat,
  streamOllamaChat,
  type ChatMessage,
} from '../../../lib/ollama';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CHAT_RATE_MAX = Math.max(5, parseInt(process.env.AI_CHAT_RATE_LIMIT_MAX ?? '40', 10) || 40);
const CHAT_RATE_WINDOW_MS = Math.max(
  10_000,
  parseInt(process.env.AI_CHAT_RATE_LIMIT_WINDOW_MS ?? '60000', 10) || 60_000,
);

function isChapterSlug(value: unknown): value is ChapterSlug {
  return typeof value === 'string' && chapters.some((chapter) => chapter.slug === value);
}

function withRequestId(response: NextResponse, requestId: string) {
  response.headers.set('X-Request-ID', requestId);
  return response;
}

function appendServerTiming(headers: Headers, metric: string, durationMs: number) {
  const formatted = `${metric};dur=${Math.max(0, durationMs).toFixed(1)}`;
  const existing = headers.get('Server-Timing');
  headers.set('Server-Timing', existing ? `${existing}, ${formatted}` : formatted);
}

export async function GET(request: NextRequest) {
  const requestId = getOrCreateRequestId(request);
  const startedAt = performance.now();
  const health = await getOllamaHealth();
  if (process.env.NODE_ENV === 'production') {
    const { baseUrl: _drop, ...rest } = health;
    const response = withRequestId(NextResponse.json(rest), requestId);
    appendServerTiming(response.headers, 'ollama-health', health.durationMs ?? performance.now() - startedAt);
    appendServerTiming(response.headers, 'route-total', performance.now() - startedAt);
    return response;
  }
  const response = withRequestId(NextResponse.json(health), requestId);
  appendServerTiming(response.headers, 'ollama-health', health.durationMs ?? performance.now() - startedAt);
  appendServerTiming(response.headers, 'route-total', performance.now() - startedAt);
  return response;
}

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId(request);
  const path = request.nextUrl.pathname;
  const startedAt = performance.now();

  const limited = checkMemoryRateLimit(
    `chat:${getClientIp(request)}`,
    CHAT_RATE_MAX,
    CHAT_RATE_WINDOW_MS,
  );
  if (!limited.ok) {
    const response = withRequestId(
      NextResponse.json(
        {
          error: 'Too many chat requests. Please wait a moment and try again.',
          code: 'RATE_LIMIT',
          requestId,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(limited.retryAfterSec) },
        },
      ),
      requestId,
    );
    appendServerTiming(response.headers, 'route-total', performance.now() - startedAt);
    return response;
  }

  try {
    const raw = await request.text();
    const parsed = parseChatJsonRaw(raw);
    if (!parsed.ok) {
      const response = withRequestId(
        NextResponse.json({ error: parsed.error, requestId }, { status: parsed.status }),
        requestId,
      );
      appendServerTiming(response.headers, 'route-total', performance.now() - startedAt);
      return response;
    }

    const validated = validateChatPostBody(parsed.value, isChapterSlug);
    if (!validated.ok) {
      const response = withRequestId(
        NextResponse.json({ error: validated.error, requestId }, { status: validated.status }),
        requestId,
      );
      appendServerTiming(response.headers, 'route-total', performance.now() - startedAt);
      return response;
    }

    const messages = validated.messages as ChatMessage[];
    const chapterSlug = validated.chapterSlug as ChapterSlug | null;

    if (!validated.stream) {
      const result = await requestOllamaChat(messages, chapterSlug);
      const response = withRequestId(
        NextResponse.json({
          reply: result.content,
          model: result.model,
          chapterSlug,
          requestId,
          usage: {
            promptTokens: result.promptTokens,
            responseTokens: result.responseTokens,
            doneReason: result.doneReason,
          },
        }),
        requestId,
      );
      appendServerTiming(response.headers, 'ollama-upstream', result.upstreamMs ?? 0);
      appendServerTiming(response.headers, 'route-total', performance.now() - startedAt);
      return response;
    }

    const streamed = streamOllamaChat(messages, chapterSlug, {
      signal: request.signal,
    });
    const headers = new Headers(streamed.headers);
    headers.set('X-Request-ID', requestId);
    appendServerTiming(headers, 'ai-ack', performance.now() - startedAt);
    return new Response(streamed.body, { status: streamed.status, headers });
  } catch (error) {
    logRouteError({ requestId, path, method: 'POST', error });
    const { status, body } = mapAiRouteError(error, requestId);
    const response = withRequestId(NextResponse.json(body, { status }), requestId);
    appendServerTiming(response.headers, 'route-total', performance.now() - startedAt);
    return response;
  }
}
