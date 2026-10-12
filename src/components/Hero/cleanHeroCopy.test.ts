import { describe, it, expect } from 'vitest';
import { cleanHeroCopy } from './cleanHeroCopy';

describe('cleanHeroCopy', () => {
  it('returns an empty string for missing copy', () => {
    expect(cleanHeroCopy(undefined)).toBe('');
  });

  it('collapses doubled spaces and Windows line breaks', () => {
    expect(cleanHeroCopy("I'm  a developer\r\n")).toBe("I'm a developer");
  });

  it('replaces a trailing ellipsis with a full stop', () => {
    expect(cleanHeroCopy('fast, and user-friendly websites...\r\n')).toBe('fast, and user-friendly websites.');
    expect(cleanHeroCopy('websites…')).toBe('websites.');
  });

  it('strips emoji including skin-tone modifiers', () => {
    expect(cleanHeroCopy('Hi\u{1F44B}\u{1F3FB} there')).toBe('Hi there');
  });
});
