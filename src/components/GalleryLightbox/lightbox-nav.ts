// Pure navigation logic of the gallery lightbox (no DOM), unit tested.

export type LightboxAction = 'previous' | 'next' | 'close';

/** Minimum horizontal pointer travel in px that counts as a swipe. */
export const SWIPE_THRESHOLD_PX = 50;

/** Wrap any index into 0..total-1, so next on the last image opens the first. */
export function wrapIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

/** Index after a previous/next step, wrapping at both ends. */
export function stepIndex(index: number, action: 'previous' | 'next', total: number): number {
  return wrapIndex(index + (action === 'next' ? 1 : -1), total);
}

/** Map a KeyboardEvent.key to a lightbox action, or null for any other key. */
export function keyToAction(key: string): LightboxAction | null {
  switch (key) {
    case 'ArrowLeft':
      return 'previous';
    case 'ArrowRight':
      return 'next';
    case 'Escape':
      return 'close';
    default:
      return null;
  }
}

/**
 * Swipe direction from pointer travel. A swipe left shows the next image, a swipe
 * right the previous one. Mostly vertical movement is not a swipe.
 */
export function swipeToAction(
  deltaX: number,
  deltaY: number,
  threshold: number = SWIPE_THRESHOLD_PX,
): 'previous' | 'next' | null {
  if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY)) return null;
  return deltaX < 0 ? 'next' : 'previous';
}

/** Fill a counter template such as "{current} / {total}" (current is 1-based). */
export function formatCounter(template: string, index: number, total: number): string {
  return template.replaceAll('{current}', String(index + 1)).replaceAll('{total}', String(total));
}

/** Indexes of the previous and next image to preload (none for a single image). */
export function neighbourIndexes(index: number, total: number): number[] {
  if (total <= 1) return [];
  const previous = wrapIndex(index - 1, total);
  const next = wrapIndex(index + 1, total);
  return previous === next ? [next] : [previous, next];
}
