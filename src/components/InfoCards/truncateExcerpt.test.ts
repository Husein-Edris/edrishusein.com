import { describe, it, expect } from 'vitest';
import { truncateExcerpt } from './truncateExcerpt';

describe('truncateExcerpt', () => {
  it('returns an empty string for missing input', () => {
    expect(truncateExcerpt(undefined)).toBe('');
    expect(truncateExcerpt(null)).toBe('');
  });

  it('keeps short excerpts unchanged, including their HTML', () => {
    expect(truncateExcerpt('<p>Short text</p>', 120)).toBe('<p>Short text</p>');
  });

  it('strips HTML and cuts long excerpts at the last word boundary', () => {
    const result = truncateExcerpt('<p>one two three four five</p>', 12);
    expect(result).toBe('one two...');
  });
});
