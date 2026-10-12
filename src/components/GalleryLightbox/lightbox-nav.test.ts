import { describe, it, expect } from 'vitest';
import {
  formatCounter,
  keyToAction,
  neighbourIndexes,
  stepIndex,
  swipeToAction,
  wrapIndex,
} from './lightbox-nav';

describe('wrapIndex', () => {
  it('keeps an index inside the range', () => {
    expect(wrapIndex(2, 8)).toBe(2);
  });

  it('wraps past the last image to the first and before the first to the last', () => {
    expect(wrapIndex(8, 8)).toBe(0);
    expect(wrapIndex(-1, 8)).toBe(7);
    expect(wrapIndex(-9, 8)).toBe(7);
  });

  it('returns 0 for an empty gallery', () => {
    expect(wrapIndex(3, 0)).toBe(0);
  });
});

describe('stepIndex', () => {
  it('moves forward and back with wrap-around', () => {
    expect(stepIndex(0, 'next', 4)).toBe(1);
    expect(stepIndex(3, 'next', 4)).toBe(0);
    expect(stepIndex(0, 'previous', 4)).toBe(3);
  });

  it('stays on the only image of a single-image gallery', () => {
    expect(stepIndex(0, 'next', 1)).toBe(0);
    expect(stepIndex(0, 'previous', 1)).toBe(0);
  });
});

describe('keyToAction', () => {
  it('maps the arrow keys and Escape', () => {
    expect(keyToAction('ArrowLeft')).toBe('previous');
    expect(keyToAction('ArrowRight')).toBe('next');
    expect(keyToAction('Escape')).toBe('close');
  });

  it('ignores every other key', () => {
    expect(keyToAction('Enter')).toBeNull();
    expect(keyToAction('Tab')).toBeNull();
    expect(keyToAction('ArrowUp')).toBeNull();
  });
});

describe('swipeToAction', () => {
  it('treats a swipe left as next and a swipe right as previous', () => {
    expect(swipeToAction(-80, 5)).toBe('next');
    expect(swipeToAction(80, -5)).toBe('previous');
  });

  it('ignores movement below the threshold', () => {
    expect(swipeToAction(-49, 0)).toBeNull();
    expect(swipeToAction(-50, 0)).toBe('next');
  });

  it('ignores mostly vertical movement', () => {
    expect(swipeToAction(-60, 120)).toBeNull();
  });
});

describe('formatCounter', () => {
  it('fills a 1-based current index and the total', () => {
    expect(formatCounter('{current} / {total}', 2, 8)).toBe('3 / 8');
  });

  it('supports a custom CMS template', () => {
    expect(formatCounter('Bild {current} von {total}', 0, 4)).toBe('Bild 1 von 4');
  });
});

describe('neighbourIndexes', () => {
  it('returns the previous and next image with wrap-around', () => {
    expect(neighbourIndexes(0, 5)).toEqual([4, 1]);
  });

  it('returns one neighbour for two images and none for one', () => {
    expect(neighbourIndexes(0, 2)).toEqual([1]);
    expect(neighbourIndexes(0, 1)).toEqual([]);
  });
});
