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
      lastModified: new Date(item.modified || item.date || 0),
      changeFrequency,
      priority,
    }));
}
