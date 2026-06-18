import {
  OLLAMA_EMPTY,
  OLLAMA_STREAM_MALFORMED,
  OLLAMA_STREAM_TOO_LARGE,
  OLLAMA_TIMEOUT,
  OLLAMA_UPSTREAM,
  OllamaCallError,
} from './upstream-errors';

export type PublicErrorBody = {
  error: string;
  hint?: string;
  code?: string;
  requestId: string;
};

const PROD_MAX_ERROR_LEN = 220;

function safeMessage(raw: string, production: boolean): string {
  if (!production || raw.length <= PROD_MAX_ERROR_LEN) return raw;
  return 'The AI service did not return a usable response.';
}

/**
 * Maps thrown values to HTTP status + client-safe JSON for AI proxy routes.
 */
export function mapAiRouteError(
  error: unknown,
  requestId: string,
): { status: number; body: PublicErrorBody } {
  const production = process.env.NODE_ENV === 'production';

  if (error instanceof OllamaCallError) {
    if (error.code === OLLAMA_TIMEOUT) {
      return {
        status: 504,
        body: {
          requestId,
          code: error.code,
          error: 'The AI service took too long to respond. Please try again with a shorter question.',
          hint: 'If this keeps happening, check that Ollama is running and not overloaded.',
        },
      };
    }
    if (error.code === OLLAMA_STREAM_TOO_LARGE) {
      return {
        status: 502,
        body: {
          requestId,
          code: error.code,
          error: 'The AI reply was too large to stream safely. Try a more focused question.',
        },
      };
    }
    if (error.code === OLLAMA_STREAM_MALFORMED || error.code === OLLAMA_EMPTY) {
      return {
        status: 502,
        body: {
          requestId,
          code: error.code,
          error:
            error.code === OLLAMA_EMPTY
              ? 'The AI returned an empty response. Try again or pick a different model.'
              : 'The AI stream was interrupted or invalid. Please try again.',
        },
      };
    }
    return {
      status: 502,
      body: {
        requestId,
        code: error.code || OLLAMA_UPSTREAM,
        error: safeMessage(error.message, production),
        hint: 'Confirm Ollama is running and OLLAMA_MODEL is installed (`ollama list`).',
      },
    };
  }

  const raw =
    error instanceof Error ? error.message : 'Unable to reach the AI service.';
  return {
    status: 502,
    body: {
      requestId,
      error: safeMessage(raw, production),
      hint: 'Make sure Ollama is running locally and the configured model is installed.',
    },
  };
}
