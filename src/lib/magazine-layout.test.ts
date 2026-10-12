import { describe, it, expect } from 'vitest';
import { magazineSizes, showsExcerpt } from './magazine-layout';

describe('magazineSizes', () => {
  it('lays out eight posts as xl, m, m, s, s, s, w, w', () => {
    expect(magazineSizes(8)).toEqual(['xl', 'm', 'm', 's', 's', 's', 'w', 'w']);
  });

  it('handles empty and single post archives', () => {
    expect(magazineSizes(0)).toEqual([]);
    expect(magazineSizes(1)).toEqual(['full']);
  });

  it('widens an incomplete small row into wide cards', () => {
    expect(magazineSizes(5)).toEqual(['xl', 'm', 'm', 'w', 'w']);
    expect(magazineSizes(4)).toEqual(['xl', 'm', 'm', 'full']);
  });

  it('gives an odd last wide card the full row', () => {
    expect(magazineSizes(9)).toEqual(['xl', 'm', 'm', 's', 's', 's', 'w', 'w', 'full']);
  });
});

describe('showsExcerpt', () => {
  it('shows the excerpt on large cards only', () => {
    expect(['xl', 'm', 's', 'w', 'full'].map((size) => showsExcerpt(size as never))).toEqual([true, false, false, true, true]);
  });
});
