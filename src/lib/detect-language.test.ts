import { describe, it, expect } from 'vitest';
import { detectContentLanguage } from './detect-language';

describe('detectContentLanguage', () => {
  it('returns de for German article title and excerpt', () => {
    const text =
      'Website erstellen lassen: Was kostet eine professionelle Website und warum lohnt sich das für Unternehmen in Österreich?';
    expect(detectContentLanguage(text)).toBe('de');
  });

  it('returns en for English article title and excerpt', () => {
    const text =
      'How to build a headless WordPress site with Next.js and why it is faster for your visitors.';
    expect(detectContentLanguage(text)).toBe('en');
  });

  it('returns en for empty or missing text', () => {
    expect(detectContentLanguage('')).toBe('en');
    expect(detectContentLanguage(null)).toBe('en');
    expect(detectContentLanguage(undefined)).toBe('en');
  });

  it('ignores HTML tags when counting words', () => {
    const text = '<p>Die Kosten für eine Website sind nicht immer klar, aber man kann sie gut planen.</p>';
    expect(detectContentLanguage(text)).toBe('de');
  });

  it('returns en on a tie (site default)', () => {
    expect(detectContentLanguage('xyz 123')).toBe('en');
  });
});
