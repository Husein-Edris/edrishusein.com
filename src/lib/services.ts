import { cmsRest, isTransientCmsError } from './rest-client';
import { transformService, type RestService, type Service } from './transform/transformService';
import { rendered } from './transform/transformProjects';
import { decodeEntities } from './transform/decodeEntities';
import { localePath, type LanguageAlternates } from './i18n/paths';
import { localizeRestItem } from './i18n/localize';
import { otherLang, type Lang } from './i18n/lang';

// The service list stays under 10 items, so one request serves the index, the
// detail pages and the slug lookup (done in code, not with ?slug=, because the
// German slug is an ACF field the REST API cannot filter on).
export const SERVICES_REST_PATH =
  '/service?per_page=20&orderby=menu_order&order=asc&acf_format=standard&_fields=id,slug,title,excerpt,content,modified,acf_fields';

/**
 * Every service in a language, in menu order.
 *
 * A transient CMS failure rethrows so ISR keeps serving the last good render
 * (same rule as DataFetcher). There is no static fallback: service copy lives in
 * the CMS only. A permanent answer, such as a 404 while the theme that registers
 * the post type is not deployed yet, is logged and returns no services, so every
 * page still builds and no service page, nav link or sitemap entry appears.
 */
export async function getServices(lang: Lang): Promise<Service[]> {
  try {
    const items = await cmsRest<unknown>(SERVICES_REST_PATH);
    return Array.isArray(items) ? items.map((item) => transformService(item as RestService, lang)) : [];
  } catch (error: unknown) {
    if (isTransientCmsError(error)) throw error;
    console.error('Error fetching services, rendering none:', error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Same list, but never throws: any failure renders no services.
 *
 * For shared chrome (the Header and Footer nav link), which every route renders.
 * Same trade-off as getSiteContentOrDefaults: a rethrow would turn one transient
 * CMS fault into an error on every page for one nav link. A page rendered during
 * an outage hides the link until its next ISR refresh.
 */
export async function getServicesOrEmpty(lang: Lang): Promise<Service[]> {
  try {
    return await getServices(lang);
  } catch (error: unknown) {
    console.error('Services unavailable for shared chrome, hiding the nav link:', error instanceof Error ? error.message : error);
    return [];
  }
}

/** Services whose `related_projects` list a project (reverse link on case studies). */
export function servicesForProject(services: Service[], projectId: number): Service[] {
  return services.filter((service) => service.relatedProjectIds.includes(projectId));
}

/** A related case study or article on a service page. */
export interface ServiceLink {
  id: number;
  title: string;
  /** Plain-text teaser, '' when the item has none. */
  excerpt: string;
  /** Public path in the page language. */
  path: string;
}

export interface ServiceRelations {
  projects: ServiceLink[];
  posts: ServiceLink[];
}

interface RelatedRestItem {
  id: number | string;
  slug: string;
  title?: { rendered?: string } | string;
  excerpt?: { rendered?: string } | string;
  acf_fields?: unknown;
}

const RELATED_KINDS = {
  projects: { restPath: '/project', segment: '/projects', label: 'related projects' },
  posts: { restPath: '/posts', segment: '/notebook', label: 'related posts' },
} as const;

const plainText = (html: string): string => decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/**
 * The items behind one relationship field, in the order the editor set. Only the
 * title translations are requested, not the full ACF payload.
 */
async function fetchRelated(kind: keyof ServiceRelations, ids: number[], lang: Lang): Promise<ServiceLink[]> {
  if (ids.length === 0) return [];
  const { restPath, segment, label } = RELATED_KINDS[kind];
  const fields = 'id,slug,title,excerpt,acf_fields.title_de,acf_fields.excerpt_de';

  try {
    const items = await cmsRest<unknown>(
      `${restPath}?include=${ids.join(',')}&per_page=${ids.length}&_fields=${fields}`
    );
    if (!Array.isArray(items)) return [];
    const byId = new Map((items as RelatedRestItem[]).map((item) => [Number(item.id), localizeRestItem(item, lang)]));
    return ids
      .map((id) => byId.get(id))
      .filter((item): item is RelatedRestItem => Boolean(item?.slug))
      .map((item) => ({
        id: Number(item.id),
        title: decodeEntities(rendered(item.title)),
        excerpt: plainText(rendered(item.excerpt)),
        path: localePath(`${segment}/${item.slug}`, lang),
      }));
  } catch (error: unknown) {
    // A CMS fault must not be cached as a page without its proof: rethrow so ISR
    // keeps the last good render. A permanent answer drops only this block.
    if (isTransientCmsError(error)) throw error;
    console.error(`Error fetching ${label} for a service page:`, error instanceof Error ? error.message : error);
    return [];
  }
}

/** Case studies and articles a service page links to, in the page language. */
export async function getServiceRelations(service: Service, lang: Lang): Promise<ServiceRelations> {
  const [projects, posts] = await Promise.all([
    fetchRelated('projects', service.relatedProjectIds, lang),
    fetchRelated('posts', service.relatedPostIds, lang),
  ]);
  return { projects, posts };
}

/** The slug of a service in a language. */
function slugFor(service: Service, lang: Lang): string {
  return lang === 'de' ? service.slugDe : service.slug;
}

/** Public path of a service page: /services/<slug> or /de/services/<slug_de>. */
export function servicePath(service: Service, lang: Lang): string {
  return localePath(`/services/${slugFor(service, lang)}`, lang);
}

/**
 * Next metadata `alternates` for a service page. Unlike alternatesFor(), the two
 * languages have different slugs, so each hreflang gets its own path. x-default
 * is the English page.
 */
export function serviceAlternates(service: Service, lang: Lang): LanguageAlternates {
  const en = servicePath(service, 'en');
  return {
    canonical: servicePath(service, lang),
    languages: { en, de: servicePath(service, 'de'), 'x-default': en },
  };
}

export interface ResolvedService {
  service: Service;
  /** The canonical slug in the requested language. */
  slug: string;
  /** Set when the other language's slug was requested: the path to redirect to. */
  redirectTo?: string;
}

/**
 * Look up a requested slug. The page language's own slug wins; the other
 * language's slug (e.g. an old or hand-edited link with the English slug on
 * /de) resolves with a redirect target; anything else is null (404).
 */
export function resolveServiceSlug(lang: Lang, slug: string, services: Service[]): ResolvedService | null {
  if (!slug) return null;

  const own = services.find((service) => slugFor(service, lang) === slug);
  if (own) return { service: own, slug };

  const crossed = services.find((service) => slugFor(service, otherLang(lang)) === slug);
  if (!crossed) return null;

  return { service: crossed, slug: slugFor(crossed, lang), redirectTo: servicePath(crossed, lang) };
}
