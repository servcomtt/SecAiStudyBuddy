'use client';

import { useEffect } from 'react';

export default function ErrorBoundaryPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app error boundary]', error);
  }, [error]);

  return (
    <div className="panel" style={{ maxWidth: 560, margin: '2rem auto' }}>
      <p className="eyebrow">Something went wrong</p>
      <h2>This page hit an unexpected error</h2>
      <p className="panel__copy">
        Your progress in other areas of the app should be unaffected. You can try again or return to
        the dashboard.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <button type="button" className="topbar__button" onClick={() => reset()}>
          Try again
        </button>
        <a href="/dashboard" className="topbar__button topbar__button--secondary">
          Dashboard
        </a>
      </div>
    </div>
  );
}
