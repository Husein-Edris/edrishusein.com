import { describe, it, expect } from 'vitest';
import { asArray } from './asArray';

describe('asArray', () => {
  it('returns the array unchanged when given an array', () => {
    const input = [{ a: 1 }, { a: 2 }];
    expect(asArray(input)).toBe(input);
  });

  it('returns [] for undefined (absent ACF field)', () => {
    expect(asArray(undefined)).toEqual([]);
  });

  it('returns [] for null', () => {
    expect(asArray(null)).toEqual([]);
  });

  it('returns [] for false (ACF serializes empty repeaters as false)', () => {
    expect(asArray(false)).toEqual([]);
  });

  it('returns [] for a string (ACF returning a scalar)', () => {
    expect(asArray('MISSING')).toEqual([]);
  });

  it('returns [] for an object (non-array shape)', () => {
    expect(asArray({ length: 2 })).toEqual([]);
  });
});
