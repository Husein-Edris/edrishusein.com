import { describe, it, expect } from 'vitest';
import { selectRelatedByRotation } from './related-content';

const items = [
  { slug: 'a' },
  { slug: 'b' },
  { slug: 'c' },
  { slug: 'd' },
  { slug: 'e' },
];

describe('selectRelatedByRotation', () => {
  it('picks the items following the current one', () => {
    expect(selectRelatedByRotation(items, 'a', 3).map((i) => i.slug)).toEqual(['b', 'c', 'd']);
  });

  it('wraps around the end of the list', () => {
    expect(selectRelatedByRotation(items, 'd', 3).map((i) => i.slug)).toEqual(['e', 'a', 'b']);
  });

  it('never includes the current item', () => {
    for (const item of items) {
      const related = selectRelatedByRotation(items, item.slug, 4);
      expect(related.map((i) => i.slug)).not.toContain(item.slug);
    }
  });

  it('gives every item at least one inbound link across the whole set', () => {
    const inbound = new Map(items.map((i) => [i.slug, 0]));

    for (const item of items) {
      for (const related of selectRelatedByRotation(items, item.slug, 3)) {
        inbound.set(related.slug, (inbound.get(related.slug) ?? 0) + 1);
      }
    }

    // The old "3 newest" behaviour left older entries on zero. Rotation must not.
    expect([...inbound.values()].every((count) => count > 0)).toBe(true);
  });

  it('distributes inbound links evenly', () => {
    const inbound = new Map(items.map((i) => [i.slug, 0]));

    for (const item of items) {
      for (const related of selectRelatedByRotation(items, item.slug, 3)) {
        inbound.set(related.slug, (inbound.get(related.slug) ?? 0) + 1);
      }
    }

    expect(new Set(inbound.values()).size).toBe(1);
  });

  it('falls back to excluding by slug when the current item is absent', () => {
    expect(selectRelatedByRotation(items, 'missing', 2).map((i) => i.slug)).toEqual(['a', 'b']);
  });

  it('returns fewer items than requested when the list is short', () => {
    expect(selectRelatedByRotation([{ slug: 'a' }, { slug: 'b' }], 'a', 3).map((i) => i.slug)).toEqual(['b']);
  });

  it('returns an empty array for a single-item list', () => {
    expect(selectRelatedByRotation([{ slug: 'only' }], 'only', 3)).toEqual([]);
  });

  it('returns an empty array for an empty list', () => {
    expect(selectRelatedByRotation([], 'a', 3)).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const input = [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }];
    const snapshot = [...input];

    selectRelatedByRotation(input, 'b', 2);

    expect(input).toEqual(snapshot);
  });
});
