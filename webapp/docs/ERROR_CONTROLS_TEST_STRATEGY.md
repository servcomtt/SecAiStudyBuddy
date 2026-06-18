# Error controls and test strategy (SecAIPlus webapp)

This document ties the **error control framework** to **what to automate or check manually** for the Next.js app (`webapp/`) and the Express LMS (`server.js`).

## Implemented controls

### Frontend (`webapp/`)

- **AI chat** (`components/ai-chat.tsx`): required non-empty prompt, `maxLength` aligned with server (`lib/chat-limits.ts`), character counter, duplicate-submit guard (`pendingSubmitRef`), `AbortSignal.timeout` for long stalls, JSON parse guard on SSE events, friendly copy via `toFriendlyAiErrorMessage`, dismiss on error banner.
- **Quiz quick-learn** (`components/chapter-quiz-player.tsx`): client timeout on `/api/quiz/explain`, friendly errors, **Retry** for live explanations; review tab still uses **Regenerate**.
- **React boundaries**: `app/error.tsx` (segment), `app/global-error.tsx` (root).

### API routes (Next.js)

- **Schema / size**: `parseChatJsonRaw` + validators on `/api/chat` and `/api/quiz/explain` (400 / 413).
- **Rate limits**: in-memory per IP for chat and explain (429 + `Retry-After`); tune with `AI_CHAT_RATE_LIMIT_*` and `AI_EXPLAIN_RATE_LIMIT_*`.
- **Request IDs**: `X-Request-ID` header (and body on JSON errors / health); accepts inbound `X-Request-ID` if well-formed.
- **Structured logs**: `logRouteError` JSON lines (stack only outside production).
- **Ollama**: typed `OllamaCallError` codes, configurable `OLLAMA_TIMEOUT_MS`, stream byte cap `OLLAMA_MAX_STREAM_OUT_BYTES`, SSE parse errors surfaced as `event: error` instead of crashing the process.
- **Public mapping**: `mapAiRouteError` — e.g. 504 for timeouts, safe short messages in production.

### Express LMS (`server.js`)

- **Request ID** middleware and **error handler** returns `{ error, requestId }` without stack traces for 5xx.
- Existing: rate limits, body size, security headers, input sanitizer (see `middleware/security`).

### Ollama (shared library `webapp/lib/ollama.ts`)

- Fetch timeouts, non-OK upstream handling, empty / invalid JSON handling, stream size guard, malformed NDJSON lines → controlled SSE error event.

## Suggested test cases (add over time)

| Area | Case | Type |
|------|------|------|
| Frontend | Empty chat submit shows validation | Unit / E2E |
| Frontend | Over-max length blocked by `maxLength` + message | Unit |
| Frontend | Double-click does not duplicate in-flight request | E2E / manual |
| Frontend | Timeout shows friendly message | Integration |
| Frontend | Error boundary renders + reset works | E2E |
| API | Invalid JSON → 400 | Integration |
| API | Oversized body → 413 | Integration |
| API | Burst over limit → 429 | Integration |
| API | Ollama timeout → 504 JSON (non-stream) | Integration (mock) |
| API | Health includes `requestId`, no `baseUrl` leak in prod for `/api/chat` GET | Smoke |
| Ollama | Offline → 502 safe body | Integration |
| DB / LMS | Duplicate key / validation | Existing Express tests |

## Priority order (from framework)

1. Input validation and payload limits — **done** for AI routes.
2. Centralized API error mapping and logging — **done** for Next AI routes; Express already centralizes errors.
3. Timeouts and fallbacks for Ollama — **done** (server + client timeouts).
4. Safe user-facing messages — **done** (mapper + `toFriendlyAiErrorMessage`).
5. DB transactions / constraints — **LMS** (SQLite/Postgres); extend tests in `tests/` as needed.
6. Rate limiting — **LMS** global + auth; **Next** AI-specific in-memory.
7. Retries — **client-only** where safe (quiz Retry); server retries to Ollama not added (avoid duplicate side effects on non-idempotent calls).

## Environment variables (reference)

| Variable | Purpose |
|----------|---------|
| `OLLAMA_TIMEOUT_MS` | Upstream Ollama fetch timeout (default 60000) |
| `OLLAMA_MAX_STREAM_OUT_BYTES` | Max forwarded SSE bytes (default 2 MiB) |
| `AI_CHAT_RATE_LIMIT_MAX` | Chat POSTs per IP per window (default 40) |
| `AI_CHAT_RATE_LIMIT_WINDOW_MS` | Window length (default 60000) |
| `AI_EXPLAIN_RATE_LIMIT_MAX` | Explain POSTs per IP per window (default 30) |
| `AI_EXPLAIN_RATE_LIMIT_WINDOW_MS` | Window length (default 60000) |
