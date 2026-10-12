import { decodeEntities } from './transform/decodeEntities';

/** Average adult reading speed used for the computed reading time. */
export const WORDS_PER_MINUTE = 200;

/**
 * A CMS reading time further than this factor from the computed one (either
 * direction) is treated as a typo or leftover test value, e.g. "55" on a
 * 500-word post, and the computed value is shown instead.
 */
export const MAX_CMS_DEVIATION = 3;

export interface ReadingTime {
  readonly minutes: number;
  /** 'cms' when the ACF reading_time field was used, else 'computed'. */
  readonly source: 'cms' | 'computed';
  /** The CMS value that was ignored for deviating too far, else null. */
  readonly rejectedCmsValue: number | null;
}

export function countWords(html: string): number {
  const text = decodeEntities(html.replace(/<[^>]*>/g, ' '));
  return text.split(/\s+/).filter(Boolean).length;
}

export function computeReadingMinutes(html: string): number {
  return Math.max(1, Math.ceil(countWords(html) / WORDS_PER_MINUTE));
}

/** Whole positive minutes from the ACF field ("5" or "5 min read"), or null for empty or junk input. */
export function parseCmsMinutes(value: unknown): number | null {
  const raw = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  const match = raw.match(/^(\d+)(\s*min\b.*)?$/i);
  if (!match) return null;
  const minutes = Number(match[1]);
  return minutes > 0 ? minutes : null;
}

/**
 * Reading time for a post: the CMS value when it is a plausible number,
 * otherwise the time computed from the article's word count.
 */
export function resolveReadingTime(cmsValue: unknown, contentHtml: string): ReadingTime {
  const computed = computeReadingMinutes(contentHtml);
  const cms = parseCmsMinutes(cmsValue);
  if (cms === null) return { minutes: computed, source: 'computed', rejectedCmsValue: null };

  const ratio = Math.max(cms, computed) / Math.min(cms, computed);
  if (ratio > MAX_CMS_DEVIATION) return { minutes: computed, source: 'computed', rejectedCmsValue: cms };
  return { minutes: cms, source: 'cms', rejectedCmsValue: null };
}
