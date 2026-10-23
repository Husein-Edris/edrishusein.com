'use client';

import { useEffect } from 'react';

// Sets <html lang> for a page whose main language differs from the root
// layout's "en" (the German landing page), and restores it on leaving so client
// navigation back to an English page is announced as English again. A second
// root layout would need every route moved into route groups.
export default function DocumentLang({ lang }: { lang: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.lang;
    root.lang = lang;
    return () => {
      root.lang = previous;
    };
  }, [lang]);

  return null;
}
