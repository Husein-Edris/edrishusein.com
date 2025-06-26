'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="container">
        <h2>Something went wrong!</h2>
        <p>We encountered an error while loading the page.</p>
        <button
          onClick={() => reset()}
          className="retry-button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}