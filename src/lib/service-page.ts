import type { Metadata } from 'next';
import { getServices, resolveServiceSlug, serviceAlternates, servicePath } from './services';
import { metaDescriptionFrom, pageOpenGraph } from './seo-utils';
import { dictionary } from './i18n/dictionary';
import type { Lang } from './i18n/lang';
import type { Service } from './transform/transformService';

// Data decisions of the service routes (app/[lang]/services/**), kept out of the
// route files so they are testable. Every loader lets a transient CMS error
// propagate: a failed build or a kept ISR render is safe, a 404 or an empty page
// baked into the cache for a URL that has content is not (the CMS-500 lesson).

export type ServicePageResult = { kind: 'page'; service: Service } | { kind: 'not-found' };

/**
 * generateStaticParams of /services/[slug] for one language: each service under
 * the slug of that language. The other language's slug is not prerendered; the
 * proxy redirects it. No services (or no post type yet): nothing.
 */
export async function serviceStaticParams(lang: Lang): Promise<Array<{ slug: string }>> {
  const services = await getServices(lang);
  return services.map((service) => ({ slug: lang === 'de' ? service.slugDe : service.slug }));
}

/**
 * What /services/[slug] renders: the service whose slug in the page language
 * matches, else not found. The other language's slug (e.g. the Header language
 * switch keeping the English slug on /de) is redirected by the proxy
 * (src/lib/service-redirect.ts) before it reaches the page. When the proxy
 * misses it (slug map stale or unavailable), it is a 404, never a redirect:
 * this route is ISR and a cached redirect was measured as a 308 without a
 * Location header that every later hit replayed.
 */
export async function loadServicePage(lang: Lang, slug: string): Promise<ServicePageResult> {
  const resolved = resolveServiceSlug(lang, slug, await getServices(lang));
  if (!resolved || resolved.redirectTo) return { kind: 'not-found' };
  return { kind: 'page', service: resolved.service };
}

/**
 * The services for /services, or null when there are none. The index then 404s
 * instead of publishing an empty shell that search engines could index.
 */
export async function loadServicesIndex(lang: Lang): Promise<Service[] | null> {
  const services = await getServices(lang);
  return services.length > 0 ? services : null;
}

const TITLE_SUFFIX = ' | Edris Husein';
// Same share image as the root layout; a page-level openGraph/twitter object
// replaces the layout's, so it has to name the image again.
const SHARE_IMAGE = '/images/Edris-Husein-Hero.png';

/** Metadata of a service page: SEO fields with fallbacks, per-slug hreflang. */
export function serviceMetadata(service: Service, lang: Lang): Metadata {
  const title = service.seoTitle || `${service.title}${TITLE_SUFFIX}`;
  const description = service.seoDescription || metaDescriptionFrom(service.excerpt);
  const path = servicePath(service, lang);

  return {
    title,
    description,
    alternates: serviceAlternates(service, lang),
    // pageOpenGraph localizes an English path; servicePath is already localized
    // and localePath is idempotent, so the per-language slug is kept.
    openGraph: pageOpenGraph({ title, description, path, lang, imageAlt: dictionary(lang).ogImageAlt }),
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE] },
  };
}
