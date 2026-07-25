/**
 * Related-content selection for detail pages.
 *
 * The previous "More Articles" block always rendered the 3 most recent posts, so
 * on a 7-post archive the same 3 slugs absorbed every sibling link and the older
 * posts received none. Crawl data confirmed it: notebook inbound links measured
 * 8, 8, 8, 4, 1, 1, 1, leaving the tail reachable only from the archive page.
 *
 * Rotation fixes the distribution: each item links to the N entries that follow
 * it (wrapping past the end), so inbound links are spread evenly across the set
 * while staying deterministic, which keeps the output stable for ISR caching.
 */

export interface Slugged {
  slug: string;
}

export function selectRelatedByRotation<T extends Slugged>(
  items: readonly T[],
  currentSlug: string,
  count: number,
): T[] {
  if (items.length === 0 || count <= 0) return [];

  const currentIndex = items.findIndex((item) => item.slug === currentSlug);

  // Current item not in the list (stale cache, draft, mismatched slug): fall back
  // to a plain exclusion so the block still renders something sensible.
  if (currentIndex === -1) {
    return items.filter((item) => item.slug !== currentSlug).slice(0, count);
  }

  const rotated = [...items.slice(currentIndex + 1), ...items.slice(0, currentIndex)];

  return rotated.slice(0, count);
}
