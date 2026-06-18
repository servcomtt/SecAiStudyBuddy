/**
 * Client-safe limits; keep aligned with `lib/chat-request-validation.ts`.
 */
export const MAX_USER_MESSAGE_CHARS = 16_000;

/** Browser-side guard: abort fetch if the server/Ollama chain stalls. */
export const CLIENT_CHAT_FETCH_TIMEOUT_MS = 95_000;
