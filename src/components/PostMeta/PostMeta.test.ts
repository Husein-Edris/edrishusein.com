import { describe, it, expect } from 'vitest';
import { formatPostDate } from './PostMeta';

describe('formatPostDate', () => {
  it('reads the calendar date from the WordPress string without time zone shifts', () => {
    expect(formatPostDate('2025-09-18T00:06:45')).toBe('18 Sep 2025');
    expect(formatPostDate('2026-08-13T19:36:23')).toBe('13 Aug 2026');
  });

  it('returns an empty string for missing or invalid dates', () => {
    expect(formatPostDate('')).toBe('');
    expect(formatPostDate('2026-13-01')).toBe('');
  });
});
