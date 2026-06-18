'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import { chapters, type ChapterSlug } from '../lib/course-data';
import { CLIENT_CHAT_FETCH_TIMEOUT_MS, MAX_USER_MESSAGE_CHARS } from '../lib/chat-limits';
import { toFriendlyAiErrorMessage } from '../lib/user-facing-error';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type ChatHealth = {
  available: boolean;
  /** Omitted in production API responses so the internal Ollama URL is not exposed. */
  baseUrl?: string;
  model: string;
  modelInstalled: boolean;
  installedModels: string[];
  error: string | null;
};

const starterMessages: ChatMessage[] = [
  {
    id: 'starter-assistant',
    role: 'assistant',
    content:
      'I only help with CompTIA SecAI+ study. Ask about domains, concepts, exam strategy, or paste a SecAI+ topic to summarize.',
  },
];

export type AiChatVariant = 'page' | 'modal';

export function AiChat({ variant = 'page' }: { variant?: AiChatVariant }) {
  const isModal = variant === 'modal';
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState('');
  const [chapterSlug, setChapterSlug] = useState<ChapterSlug | 'general'>('general');
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<ChatHealth | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  const [model, setModel] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const pendingSubmitRef = useRef(false);
  const isAiReady = Boolean(health?.available && health.modelInstalled);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  async function refreshHealth() {
    setIsCheckingHealth(true);

    try {
      const response = await fetch('/api/chat', { cache: 'no-store' });
      const payload = (await response.json()) as Partial<ChatHealth>;

      const nextHealth: ChatHealth = {
        available: Boolean(payload.available),
        baseUrl: typeof payload.baseUrl === 'string' ? payload.baseUrl : undefined,
        model: typeof payload.model === 'string' ? payload.model : 'llama3',
        modelInstalled: Boolean(payload.modelInstalled),
        installedModels: Array.isArray(payload.installedModels)
          ? payload.installedModels.filter((entry): entry is string => typeof entry === 'string')
          : [],
        error: typeof payload.error === 'string' ? payload.error : null,
      };

      setHealth(nextHealth);
      setModel(nextHealth.model);
    } catch (healthError) {
      setHealth({
        available: false,
        baseUrl:
          process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:11434' : undefined,
        model: 'llama3',
        modelInstalled: false,
        installedModels: [],
        error:
          healthError instanceof Error ? healthError.message : 'Unable to check local AI status.',
      });
    } finally {
      setIsCheckingHealth(false);
    }
  }

  useEffect(() => {
    void refreshHealth();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pendingSubmitRef.current || isLoading) {
      return;
    }

    const content = input.trim();
    if (!content) {
      setInputError('Enter a question before sending.');
      return;
    }
    if (content.length > MAX_USER_MESSAGE_CHARS) {
      setInputError(
        `Keep your message under ${MAX_USER_MESSAGE_CHARS.toLocaleString()} characters.`,
      );
      return;
    }
    setInputError(null);

    if (health && !isAiReady) {
      return;
    }

    pendingSubmitRef.current = true;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };
    const assistantId = `assistant-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };
    const nextMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setIsLoading(true);
    setStatusText(chapterSlug === 'general' ? 'Streaming reply…' : `Using ${chapterSlug.toUpperCase()} context…`);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(CLIENT_CHAT_FETCH_TIMEOUT_MS),
        body: JSON.stringify({
          messages: nextMessages
            .filter((message) => message.id !== assistantId)
            .map(({ role, content: messageContent }) => ({ role, content: messageContent })),
          chapterSlug: chapterSlug === 'general' ? null : chapterSlug,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          hint?: string;
        };
        const message =
          typeof payload.error === 'string'
            ? payload.error
            : 'The local model did not return a reply.';
        const hint = typeof payload.hint === 'string' ? payload.hint : '';
        const err = new Error(hint ? `${message} — ${hint}` : message);
        if (response.status === 429) {
          err.name = 'RateLimitError';
        }
        throw err;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const appendAssistantText = (text: string) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: `${message.content}${text}` }
              : message,
          ),
        );
      };

      const handleEvent = (event: string, payload: string) => {
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(payload) as Record<string, unknown>;
        } catch {
          throw new Error('The AI stream contained invalid data.');
        }

        if (event === 'meta') {
          if (typeof parsed.model === 'string') {
            setModel(parsed.model);
          }
          if (parsed.hasChapterContext) {
            setStatusText(
              chapterSlug === 'general'
                ? 'Streaming reply…'
                : `Streaming reply with ${chapterSlug.toUpperCase()} chapter context…`,
            );
          }
          return;
        }

        if (event === 'chunk' && typeof parsed.text === 'string') {
          appendAssistantText(parsed.text);
          return;
        }

        if (event === 'done') {
          setStatusText(null);
          return;
        }

        if (event === 'error') {
          throw new Error(
            typeof parsed.message === 'string'
              ? parsed.message
              : 'Streaming response interrupted.',
          );
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

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId && !message.content.trim()
            ? { ...message, content: 'No response was generated.' }
            : message,
        ),
      );
    } catch (submissionError) {
      let message =
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to reach the local AI backend.';
      if (
        submissionError instanceof Error &&
        (submissionError.name === 'TimeoutError' || submissionError.name === 'AbortError')
      ) {
        message = 'TimeoutError';
      }
      setMessages((current) => current.filter((message) => message.id !== assistantId));
      setError(toFriendlyAiErrorMessage(message));
      void refreshHealth();
    } finally {
      pendingSubmitRef.current = false;
      setIsLoading(false);
      setStatusText(null);
    }
  }

  return (
    <section className={isModal ? 'ai-chat-panel ai-chat-panel--modal' : 'panel ai-chat-panel'}>
      <div className="panel__header">
        <div>
          <p className="eyebrow">Local AI</p>
          <h3>{isModal ? 'Your question' : 'Study chat'}</h3>
        </div>
        <div className="ai-chat-meta">
          {!isModal ? <span className="ai-chat-chip">Backend: Next.js route</span> : null}
          <span
            className={`ai-chat-chip ${
              health?.available ? 'ai-chat-chip--online' : health ? 'ai-chat-chip--offline' : ''
            }`}
          >
            Status:{' '}
            {isCheckingHealth
              ? 'Checking…'
              : isAiReady
                ? 'Online'
                : health?.available
                  ? 'Model missing'
                  : 'Offline'}
          </span>
          <span className="ai-chat-chip">Model: {model ?? 'Ollama local model'}</span>
        </div>
      </div>

      {!isModal ? (
        <p className="panel__copy">
          This chat stays on your machine when Ollama is running locally. The frontend posts to
          <code>/api/chat</code>, and the server route proxies the request to your local model.
        </p>
      ) : (
        <p className="panel__copy ai-chat-panel__modal-hint">
          Replies come from your local Ollama model via <code>/api/chat</code>.
        </p>
      )}

      <div
        className={`ai-status-banner ${
          health?.available ? 'ai-status-banner--online' : 'ai-status-banner--offline'
        }${isModal ? ' ai-status-banner--compact' : ''}`}
      >
        <div className="ai-status-banner__copy">
          <strong>
            {isCheckingHealth
              ? 'Checking local AI status…'
              : isAiReady
                ? 'AI is ready.'
                : health?.available
                  ? 'AI chat found Ollama, but the configured model is missing.'
                  : 'AI chat is visible, but the local model is offline.'}
          </strong>
          {!isModal ? (
            <span>
              {isCheckingHealth
                ? 'The app is checking your Ollama connection and configured model.'
                : isAiReady
                  ? health?.baseUrl
                    ? `Connected to ${health.baseUrl} using ${health?.model ?? 'your configured model'}.`
                    : `Connected via the server to Ollama using ${health?.model ?? 'your configured model'}.`
                  : health?.available
                    ? `Install ${health?.model ?? 'your configured model'} in Ollama to enable replies.`
                    : health?.baseUrl
                      ? `Start Ollama at ${health.baseUrl} and install ${
                          health?.model ?? 'your configured model'
                        } to enable replies.`
                      : `Start Ollama where the API runs and install ${
                          health?.model ?? 'your configured model'
                        } (production hides the internal URL).`}
            </span>
          ) : (
            <span>
              {isAiReady
                ? `Using ${health?.model ?? 'your model'} — ask below.`
                : 'Start Ollama and install the configured model to chat.'}
            </span>
          )}
          {!isModal && health && !health.available && health.error ? (
            <span>Last check: {health.error}</span>
          ) : null}
          {!isModal && health && health.available && !health.modelInstalled ? (
            <span>
              The Ollama server is reachable, but the configured model is not installed yet.
            </span>
          ) : null}
          {!isModal && health?.installedModels.length ? (
            <span>Installed models: {health.installedModels.join(', ')}</span>
          ) : null}
        </div>
        <button
          type="button"
          className="topbar__button topbar__button--secondary"
          onClick={() => void refreshHealth()}
          disabled={isCheckingHealth || isLoading}
        >
          {isCheckingHealth ? 'Checking…' : 'Refresh AI status'}
        </button>
      </div>

      <div className="ai-chat-controls">
        <label className="ai-chat-form__label" htmlFor="ai-chat-chapter">
          Chapter context
        </label>
        <select
          id="ai-chat-chapter"
          className="ai-chat-select"
          value={chapterSlug}
          onChange={(event) => setChapterSlug(event.target.value as ChapterSlug | 'general')}
          disabled={isLoading}
        >
          <option value="general">General study help</option>
          {chapters.map((chapter) => (
            <option key={chapter.slug} value={chapter.slug}>
              {chapter.fullTitle}
            </option>
          ))}
        </select>
        <p className="ai-chat-helper">
          Pick a chapter to inject topic, scenario, quiz, and lab context into the model prompt.
        </p>
      </div>

      <div className="ai-chat-log" aria-live="polite">
        {messages.filter((message) => message.content.trim()).map((message, index) => (
          <article
            key={message.id || `${message.role}-${index}`}
            className={`ai-message ai-message--${message.role}`}
          >
            <div className="ai-message__label">
              {message.role === 'assistant' ? 'Study Buddy AI' : 'You'}
            </div>
            <div className="ai-message__content">{message.content}</div>
          </article>
        ))}

        {isLoading && statusText ? (
          <article className="ai-message ai-message--assistant">
            <div className="ai-message__label">Study Buddy AI</div>
            <div className="ai-message__content">{statusText}</div>
          </article>
        ) : null}

        <div ref={endRef} />
      </div>

      {error ? (
        <div className="ai-chat-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="topbar__button topbar__button--secondary"
            style={{ marginLeft: '0.75rem' }}
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <form className="ai-chat-form" onSubmit={handleSubmit}>
        <label className="ai-chat-form__label" htmlFor="ai-chat-input">
          Ask a question
        </label>
        {inputError ? (
          <p className="ai-chat-error" role="status" style={{ marginBottom: '0.5rem' }}>
            {inputError}
          </p>
        ) : null}
        <textarea
          id="ai-chat-input"
          className="ai-chat-form__input"
          rows={4}
          maxLength={MAX_USER_MESSAGE_CHARS}
          placeholder="Example: Explain standard deviation like I’m studying for SecAI+."
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            if (inputError) setInputError(null);
          }}
          disabled={isLoading || Boolean(health && !isAiReady)}
        />
        <p className="ai-chat-helper">
          {input.length.toLocaleString()} / {MAX_USER_MESSAGE_CHARS.toLocaleString()} characters
        </p>
        <div className="ai-chat-form__actions">
          <button
            type="submit"
            className="topbar__button"
            disabled={isLoading || !input.trim() || Boolean(health && !isAiReady)}
          >
            {isLoading
              ? 'Streaming…'
              : health && !isAiReady
                ? health.available
                  ? 'Install model'
                  : 'AI offline'
                : 'Send'}
          </button>
        </div>
      </form>
    </section>
  );
}
