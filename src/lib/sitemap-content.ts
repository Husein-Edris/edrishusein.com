import type { MetadataRoute } from 'next';
import { cmsRest, isTransientCmsError } from './rest-client';
import { localePath } from './i18n/paths';

export interface SitemapContentItem {
  slug: string;
  modified?: string;
  date?: string;
}

/**
 * Fetch slug + dates for a CMS content type for the sitemap.
 *
 * A transient CMS failure throws: ISR then keeps serving the last good sitemap.
 * Returning [] here used to publish a sitemap with every post and project
 * missing (28 URLs down to 9) and cache it for the whole revalidate window.
 * A permanent answer (4xx, non-array body) still yields [] so the static pages
 * are listed.
 */
export async function fetchSitemapContent(restPath: string): Promise<SitemapContentItem[]> {
  try {
    const items = await cmsRest<SitemapContentItem[]>(restPath);
    return Array.isArray(items) ? items : [];
  } catch (error: unknown) {
    if (isTransientCmsError(error)) throw error;
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
      // Omit lastModified entirely when no date is available: an epoch date
      // (1970) would mislead crawlers into deprioritizing the page.
      lastModified: item.modified || item.date
        ? new Date((item.modified || item.date) as string)
        : undefined,
      changeFrequency,
      priority,
    }));
}

/**
 * Each English sitemap entry plus its German twin (/de + same path), both
 * naming each other and x-default (English) under alternates.languages, which
 * Next renders as xhtml:link hreflang entries.
 */
export function withLanguageVersions(entries: MetadataRoute.Sitemap, baseUrl: string): MetadataRoute.Sitemap {
  return entries.flatMap((entry) => {
    const path = entry.url.startsWith(baseUrl) ? entry.url.slice(baseUrl.length) || '/' : entry.url;
    const en = `${baseUrl}${path === '/' ? '' : localePath(path, 'en')}`;
    const de = `${baseUrl}${localePath(path, 'de')}`;
    const alternates = { languages: { en, de, 'x-default': en } };
    return [
      { ...entry, url: en, alternates },
      { ...entry, url: de, alternates },
    ];
  });
}
