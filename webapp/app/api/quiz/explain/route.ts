import { NextRequest, NextResponse } from 'next/server';

import { mapAiRouteError } from '../../../../lib/api-error-map';
import { logRouteError, getClientIp, getOrCreateRequestId } from '../../../../lib/api-request';
import { parseChatJsonRaw } from '../../../../lib/chat-request-validation';
import { chapters, type ChapterSlug } from '../../../../lib/course-data';
import { checkMemoryRateLimit } from '../../../../lib/rate-limit-memory';
import {
  OLLAMA_QUIZ_SYSTEM_PROMPT,
  streamOllamaChat,
  type ChatMessage,
} from '../../../../lib/ollama';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_QUESTION_LEN = 6_000;
const MAX_OPTION_LEN = 1_500;
const MAX_OPTIONS = 12;

const EXPLAIN_RATE_MAX = Math.max(5, parseInt(process.env.AI_EXPLAIN_RATE_LIMIT_MAX ?? '30', 10) || 30);
const EXPLAIN_RATE_WINDOW_MS = Math.max(
  10_000,
  parseInt(process.env.AI_EXPLAIN_RATE_LIMIT_WINDOW_MS ?? '60000', 10) || 60_000,
);

function isChapterSlug(value: unknown): value is ChapterSlug {
  return typeof value === 'string' && chapters.some((chapter) => chapter.slug === value);
}

function optionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

function clampText(value: string, max: number) {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

function buildQuizExplainUserMessage(input: {
  question: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  staticExplanation: string;
}): string {
  const { question, options, selectedIndex, correctIndex, staticExplanation } = input;
  const wasCorrect = selectedIndex === correctIndex;

  const optionBlock = options
    .map((opt, index) => `${optionLetter(index)}. ${opt}`)
    .join('\n');

  const parts = [
    'Here is a SecAI+ practice quiz question the learner just answered.',
    '',
    'Question:',
    question,
    '',
    'Options:',
    optionBlock,
    '',
    `The learner chose ${optionLetter(selectedIndex)} (${wasCorrect ? 'correct' : 'incorrect'}).`,
    `The correct answer is ${optionLetter(correctIndex)}.`,
  ];

  if (staticExplanation) {
    parts.push(
      '',
      'Authoritative explanation from the course question bank (align your answer with this):',
      staticExplanation,
    );
  }

  parts.push(
    '',
    'Follow your system instructions: produce the RIGHT ANSWER, WRONG TURNS, MEMORY HOOK, and EXAM TIP sections for quick learning.',
  );

  return parts.join('\n');
}

function withRequestId(response: NextResponse, requestId: string) {
  response.headers.set('X-Request-ID', requestId);
  return response;
}

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId(request);
  const path = request.nextUrl.pathname;

  const limited = checkMemoryRateLimit(
    `explain:${getClientIp(request)}`,
    EXPLAIN_RATE_MAX,
    EXPLAIN_RATE_WINDOW_MS,
  );
  if (!limited.ok) {
    return withRequestId(
      NextResponse.json(
        {
          error: 'Too many AI explanation requests. Please wait a moment and try again.',
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
  }

  try {
    const raw = await request.text();
    const parsed = parseChatJsonRaw(raw);
    if (!parsed.ok) {
      return withRequestId(
        NextResponse.json({ error: parsed.error, requestId }, { status: parsed.status }),
        requestId,
      );
    }

    const body = parsed.value as Record<string, unknown>;
    const questionRaw = typeof body.question === 'string' ? body.question : '';
    const optionsRaw = Array.isArray(body.options)
      ? body.options.filter((entry): entry is string => typeof entry === 'string')
      : [];
    const selectedIndex = typeof body.selectedIndex === 'number' ? body.selectedIndex : NaN;
    const correctIndex = typeof body.correctIndex === 'number' ? body.correctIndex : NaN;
    const chapterSlug = isChapterSlug(body.chapterSlug) ? body.chapterSlug : null;
    const staticRaw = typeof body.staticExplanation === 'string' ? body.staticExplanation : '';

    if (!questionRaw.trim() || optionsRaw.length < 2 || optionsRaw.length > MAX_OPTIONS) {
      return withRequestId(
        NextResponse.json(
          { error: 'Provide a question and between 2 and 12 string options.', requestId },
          { status: 400 },
        ),
        requestId,
      );
    }

    if (
      !Number.isInteger(selectedIndex) ||
      !Number.isInteger(correctIndex) ||
      selectedIndex < 0 ||
      correctIndex < 0 ||
      selectedIndex >= optionsRaw.length ||
      correctIndex >= optionsRaw.length
    ) {
      return withRequestId(
        NextResponse.json(
          {
            error: 'selectedIndex and correctIndex must be valid option indices.',
            requestId,
          },
          { status: 400 },
        ),
        requestId,
      );
    }

    const question = clampText(questionRaw, MAX_QUESTION_LEN);
    const options = optionsRaw.map((opt) => clampText(opt, MAX_OPTION_LEN));
    const staticExplanation = staticRaw.trim() ? clampText(staticRaw, 4_000) : '';

    const userContent = buildQuizExplainUserMessage({
      question,
      options,
      selectedIndex,
      correctIndex,
      staticExplanation,
    });

    const messages: ChatMessage[] = [{ role: 'user', content: userContent }];

    const streamed = await streamOllamaChat(messages, chapterSlug, {
      systemPromptOverride: OLLAMA_QUIZ_SYSTEM_PROMPT,
      signal: request.signal,
    });
    const headers = new Headers(streamed.headers);
    headers.set('X-Request-ID', requestId);
    return new Response(streamed.body, { status: streamed.status, headers });
  } catch (error) {
    logRouteError({ requestId, path, method: 'POST', error });
    const { status, body } = mapAiRouteError(error, requestId);
    return withRequestId(NextResponse.json(body, { status }), requestId);
  }
}
