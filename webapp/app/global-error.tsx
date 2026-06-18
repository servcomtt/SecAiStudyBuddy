'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 520 }}>
        <h1 style={{ fontSize: '1.25rem' }}>SecAIPlus Study Buddy</h1>
        <p>The application failed to render. Please try again.</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        {process.env.NODE_ENV === 'development' ? (
          <pre style={{ marginTop: '1.5rem', fontSize: 12, opacity: 0.85, whiteSpace: 'pre-wrap' }}>
            {error.message}
          </pre>
        ) : null}
      </body>
    </html>
  );
}
