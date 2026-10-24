'use client';

import { useEffect } from 'react';
import { useLang } from '@/src/components/LangProvider/LangProvider';
import { dictionary } from '@/src/lib/i18n/dictionary';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const text = dictionary(useLang()).error;

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="container">
        <h2>{text.heading}</h2>
        <p>{text.text}</p>
        <button
          onClick={() => reset()}
          className="retry-button"
        >
          {text.retry}
        </button>
      </div>
    </div>
  );
}
