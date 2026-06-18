/**
 * Maps technical API / network errors to short, safe UI copy (client-side).
 */
export function toFriendlyAiErrorMessage(raw: string): string {
  const t = raw.trim();
  if (!t) {
    return 'The AI service is temporarily unavailable. Please try again in a moment.';
  }

  if (/Too many (chat|AI explanation) requests/i.test(t) || /RATE_LIMIT/i.test(t)) {
    return t;
  }

  if (/AbortError|TimeoutError|timed out|took too long|504/i.test(t)) {
    return 'Your request took too long. Try a shorter question or check that Ollama is running.';
  }

  if (/too large|exceeds the maximum stream|413|Request body too large/i.test(t)) {
    return 'This request is too large. Shorten your message and try again.';
  }

  if (/invalid data|invalid JSON|stream returned invalid/i.test(t)) {
    return 'The AI connection was interrupted. Please try again.';
  }

  if (/fetch failed|Failed to fetch|NetworkError/i.test(t)) {
    return 'Could not reach the app server. Check your connection and try again.';
  }

  if (t.length > 280) {
    return 'Something went wrong with the AI request. Please try again.';
  }

  return t;
}
