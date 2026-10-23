import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import DocumentLang from './DocumentLang';

describe('DocumentLang', () => {
  afterEach(() => {
    cleanup();
    document.documentElement.lang = '';
  });

  it('sets the document language while mounted and restores it on unmount', () => {
    document.documentElement.lang = 'en';

    const { unmount } = render(<DocumentLang lang="de" />);
    expect(document.documentElement.lang).toBe('de');

    unmount();
    expect(document.documentElement.lang).toBe('en');
  });
});
