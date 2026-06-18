/** AI / Ollama integration — stable codes for logging and API mapping. */
export const OLLAMA_TIMEOUT = 'OLLAMA_TIMEOUT';
export const OLLAMA_UPSTREAM = 'OLLAMA_UPSTREAM';
export const OLLAMA_EMPTY = 'OLLAMA_EMPTY_RESPONSE';
export const OLLAMA_STREAM_MALFORMED = 'OLLAMA_STREAM_MALFORMED';
export const OLLAMA_STREAM_TOO_LARGE = 'OLLAMA_STREAM_TOO_LARGE';

export class OllamaCallError extends Error {
  readonly code: string;
  readonly upstreamStatus?: number;

  constructor(message: string, code: string, upstreamStatus?: number) {
    super(message);
    this.name = 'OllamaCallError';
    this.code = code;
    this.upstreamStatus = upstreamStatus;
  }
}

export function isAbortOrTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === 'AbortError') return true;
  if (error.name === 'TimeoutError') return true;
  return /aborted|timeout/i.test(error.message);
}
