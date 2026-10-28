import { describe, it, expect } from 'vitest';
import { coverFocus, DEFAULT_COVER_FOCUS } from './coverFocus';

describe('coverFocus', () => {
  it('returns the key-figure position for a post with a known cover', () => {
    expect(coverFocus('what-got-cheap-and-what-did-not')).toBe('64% 50%');
  });

  it('pins left-weighted covers to the left edge', () => {
    expect(coverFocus('website-erstellen-lassen')).toBe('0% 50%');
  });

  it('falls back to the centre for a post without an entry', () => {
    expect(coverFocus('a-post-written-next-year')).toBe(DEFAULT_COVER_FOCUS);
    expect(DEFAULT_COVER_FOCUS).toBe('50% 50%');
  });
});
