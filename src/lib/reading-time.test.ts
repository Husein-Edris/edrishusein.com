import { describe, it, expect } from 'vitest';
import { computeReadingMinutes, countWords, parseCmsMinutes, resolveReadingTime } from './reading-time';

const words = (n: number) => `<p>${Array.from({ length: n }, () => 'word').join(' ')}</p>`;

describe('countWords', () => {
  it('ignores tags and entities as separators', () => {
    expect(countWords('<h2>Two&nbsp;words</h2><p>and three more</p>')).toBe(5);
  });
});

describe('computeReadingMinutes', () => {
  it('rounds up at 200 words per minute with a 1 minute floor', () => {
    expect(computeReadingMinutes(words(1125))).toBe(6);
    expect(computeReadingMinutes(words(200))).toBe(1);
    expect(computeReadingMinutes('')).toBe(1);
  });
});

describe('parseCmsMinutes', () => {
  it('accepts whole positive numbers only', () => {
    expect(parseCmsMinutes('5')).toBe(5);
    expect(parseCmsMinutes(' 7 ')).toBe(7);
    expect(parseCmsMinutes(4)).toBe(4);
    expect(parseCmsMinutes('')).toBeNull();
    expect(parseCmsMinutes('0')).toBeNull();
    expect(parseCmsMinutes('5 min read')).toBe(5);
    expect(parseCmsMinutes('about 5')).toBeNull();
    expect(parseCmsMinutes('5 hours')).toBeNull();
    expect(parseCmsMinutes(null)).toBeNull();
  });
});

describe('resolveReadingTime', () => {
  it('uses a plausible CMS value', () => {
    expect(resolveReadingTime('5', words(1125))).toEqual({ minutes: 5, source: 'cms', rejectedCmsValue: null });
  });

  it('computes the time when the CMS field is empty', () => {
    expect(resolveReadingTime('', words(803))).toEqual({ minutes: 5, source: 'computed', rejectedCmsValue: null });
  });

  it('rejects a CMS value more than 3x off in either direction', () => {
    expect(resolveReadingTime('55', words(500))).toEqual({ minutes: 3, source: 'computed', rejectedCmsValue: 55 });
    expect(resolveReadingTime('1', words(1000))).toEqual({ minutes: 5, source: 'computed', rejectedCmsValue: 1 });
  });

  it('keeps a value exactly 3x off', () => {
    expect(resolveReadingTime('9', words(500)).source).toBe('cms');
  });
});
