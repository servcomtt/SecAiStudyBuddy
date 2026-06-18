/**
 * Client-side parser for SSE emitted by Next.js routes that proxy Ollama
 * (`/api/chat`, `/api/quiz/explain`): events `chunk`, `done`, `error`.
 */
export async function consumeOllamaSseText(
  response: Response,
  onChunk: (text: string) => void,
): Promise<void> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      hint?: string;
      code?: string;
    };
    const message =
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed (${response.status}).`;
    const hint = typeof payload.hint === 'string' ? payload.hint : '';
    throw new Error(hint ? `${message} — ${hint}` : message);
  }

  if (!response.body) {
    throw new Error('No response body from the AI route.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const handleEvent = (eventName: string, dataJson: string) => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(dataJson) as Record<string, unknown>;
    } catch {
      throw new Error('The AI stream contained invalid data. Please try again.');
    }

    if (eventName === 'meta') {
      return;
    }

    if (eventName === 'chunk' && typeof parsed.text === 'string') {
      onChunk(parsed.text);
      return;
    }

    if (eventName === 'done') {
      return;
    }

    if (eventName === 'error') {
      const msg =
        typeof parsed.message === 'string'
          ? parsed.message
          : 'The model stopped before finishing the explanation.';
      throw new Error(msg);
    }
  };

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const eventBlock of events) {
      const lines = eventBlock.split('\n');
      const eventLine = lines.find((line) => line.startsWith('event: '));
      const dataLine = lines.find((line) => line.startsWith('data: '));

      if (!eventLine || !dataLine) {
        continue;
      }

      handleEvent(eventLine.slice(7).trim(), dataLine.slice(6));
    }
  }

  if (buffer.trim()) {
    const lines = buffer.split('\n');
    const eventLine = lines.find((line) => line.startsWith('event: '));
    const dataLine = lines.find((line) => line.startsWith('data: '));

    if (eventLine && dataLine) {
      handleEvent(eventLine.slice(7).trim(), dataLine.slice(6));
    }
  }
}
