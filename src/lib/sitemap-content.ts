import type { MetadataRoute } from 'next';
import { cmsRest } from './rest-client';

export interface SitemapContentItem {
  slug: string;
  modified?: string;
  date?: string;
}

/**
 * Fetch slug + dates for a CMS content type for the sitemap. Returns [] on any
 * failure so the sitemap still generates (FR-4).
 */
export async function fetchSitemapContent(restPath: string): Promise<SitemapContentItem[]> {
  try {
    const items = await cmsRest<SitemapContentItem[]>(restPath);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/**
 * Newest `modified` (falling back to `date`) across content items, or undefined
 * when none carry a usable date. Lets listing/index pages report an honest
 * lastmod derived from their freshest child instead of the build timestamp.
 */
export function latestModified(items: SitemapContentItem[]): Date | undefined {
  const times = items
    .map((item) => item.modified || item.date)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((time) => !Number.isNaN(time));

  return times.length ? new Date(Math.max(...times)) : undefined;
}

/** Map CMS content items into sitemap entries under `${baseUrl}/${segment}/${slug}`. */
export function toSitemapEntries(
  items: SitemapContentItem[],
  baseUrl: string,
  segment: string,
  changeFrequency: 'weekly' | 'monthly',
  priority: number,
): MetadataRoute.Sitemap {
  return items
    .filter((item) => item.slug)
    .map((item) => ({
      url: `${baseUrl}/${segment}/${item.slug}`,
      // Omit lastModified entirely when no date is available — an epoch date
      // (1970) would mislead crawlers into deprioritizing the page.
      lastModified: item.modified || item.date
        ? new Date((item.modified || item.date) as string)
        : undefined,
      changeFrequency,
      priority,
    }));
}
