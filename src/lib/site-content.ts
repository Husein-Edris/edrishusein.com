import { CMS_BASE_URL } from './config';
import { cmsRest, isTransientCmsError } from './rest-client';
import { transformSiteContent, type SiteContent } from './transform/transformSiteContent';

// Custom theme route, outside the wp/v2 namespace (theme inc/api.php).
export const SITE_CONTENT_URL = `${CMS_BASE_URL}/wp-json/headless/v1/site-content`;

/**
 * Template and archive text from the CMS "Site Content" options page, with the
 * code defaults filled in for every empty field.
 *
 * A transient CMS failure rethrows, so ISR keeps serving the last good render
 * (same rule as DataFetcher). A permanent answer, such as a 404 while the theme
 * that adds the route is not deployed yet, renders the code defaults.
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const raw = await cmsRest<unknown>(SITE_CONTENT_URL);
    return transformSiteContent(raw);
  } catch (error: unknown) {
    if (isTransientCmsError(error)) {
      throw error;
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn('Site content unavailable, using code defaults:', error instanceof Error ? error.message : error);
    }
    return transformSiteContent({});
  }
}

/**
 * Same content, but never throws: any failure renders the code defaults.
 *
 * For shared chrome that every route renders (root layout cookie banner, Footer,
 * 404 page). There a rethrow would turn one transient CMS hiccup into an error
 * on every page, or fail every route of a build, for a few labels. The cost is
 * that a page rendered during an outage shows the default labels until its next
 * ISR refresh (60s), which is acceptable for chrome text. Page-specific content
 * keeps using getSiteContent() so ISR holds the last good render instead.
 */
export async function getSiteContentOrDefaults(): Promise<SiteContent> {
  try {
    return await getSiteContent();
  } catch (error: unknown) {
    console.error('Site content unavailable for shared chrome, using code defaults:', error instanceof Error ? error.message : error);
    return transformSiteContent({});
  }
}
