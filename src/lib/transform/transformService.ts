import { rendered } from './transformProjects';
import { decodeEntities } from './decodeEntities';
import { asArray } from './asArray';
import { localizeContentLinks, localizeRestItem } from '../i18n/localize';
import type { Lang } from '../i18n/lang';

// Service pages (CPT `service`, theme inc/acf-fields/service-page.php). Every
// text field `x` has a German twin `x_de`; `slug_de` is the German URL slug and
// is deliberately outside the twin cloner, so localizeAcf leaves it alone.

/** The `area_served` checkbox values, in the order schema.org lists them. */
export const AREA_SERVED_KEYS = ['vorarlberg', 'austria', 'switzerland', 'germany'] as const;

export type AreaServedKey = (typeof AREA_SERVED_KEYS)[number];

// The theme validates slug_de with the same pattern; anything else falls back to
// the English slug so a typo can never produce a broken German URL.
const SLUG_PATTERN = /^[a-z0-9-]+$/;

type Rendered = { rendered?: string } | string | undefined;

interface ServiceAcf {
  title_de?: unknown;
  excerpt_de?: unknown;
  content_de?: unknown;
  seo_title?: unknown;
  seo_description?: unknown;
  eyebrow?: unknown;
  headline?: unknown;
  primary_keyword?: unknown;
  sections?: unknown;
  faq?: unknown;
  related_projects?: unknown;
  related_posts?: unknown;
  service_type?: unknown;
  area_served?: unknown;
  slug_de?: unknown;
  cta_heading?: unknown;
  cta_text?: unknown;
  cta_label?: unknown;
  [key: string]: unknown;
}

export interface RestService {
  id: number | string;
  slug: string;
  modified?: string;
  title?: Rendered;
  excerpt?: Rendered;
  content?: Rendered;
  acf_fields?: ServiceAcf | false;
}

export interface ServiceSection {
  heading: string;
  bodyHtml: string;
}

export interface ServiceFaqEntry {
  question: string;
  answerHtml: string;
}

/** Closing call to action of a service page (ACF cta_*, one set per service). */
export interface ServiceCta {
  heading: string;
  text: string;
  /** Button label; the page falls back to a Site Content label when empty. */
  label: string;
}

export interface Service {
  id: string;
  /** English URL slug (the WordPress post slug). */
  slug: string;
  /** German URL slug (ACF slug_de), the English slug when unset. */
  slugDe: string;
  /** Short name for cards, nav and the last breadcrumb. */
  title: string;
  /** H1; the title when the field is empty. */
  headline: string;
  eyebrow: string;
  /** Card teaser (rendered excerpt HTML). */
  excerpt: string;
  /** Intro above the sections (rendered post content HTML). */
  introHtml: string;
  seoTitle: string;
  seoDescription: string;
  sections: ServiceSection[];
  faq: ServiceFaqEntry[];
  relatedProjectIds: number[];
  relatedPostIds: number[];
  serviceType: string;
  areaServed: AreaServedKey[];
  cta: ServiceCta;
  modified: string;
}

type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** A plain-text ACF field: decoded and trimmed, '' for anything that is not a string. */
const text = (value: unknown): string => (typeof value === 'string' ? decodeEntities(value.trim()) : '');

/** A wysiwyg ACF field: HTML kept as is, '' for anything that is not a string. */
const html = (value: unknown): string => (typeof value === 'string' ? value : '');

/** Relationship field (return format id): numbers, or post objects with ID/id. */
function relationIds(value: unknown): number[] {
  return asArray<unknown>(value)
    .map((entry) => (isPlainObject(entry) ? Number(entry.ID ?? entry.id) : typeof entry === 'number' ? entry : NaN))
    .filter((id) => Number.isInteger(id) && id > 0);
}

/** Checkbox field: values, or {value, label} pairs; unknown values are dropped. */
function areaKeys(value: unknown): AreaServedKey[] {
  const known = new Set<string>(AREA_SERVED_KEYS);
  const picked = asArray<unknown>(value)
    .map((entry) => (isPlainObject(entry) ? entry.value : entry))
    .filter((entry): entry is AreaServedKey => typeof entry === 'string' && known.has(entry));
  return AREA_SERVED_KEYS.filter((key) => picked.includes(key));
}

function germanSlug(value: unknown, fallback: string): string {
  const slug = typeof value === 'string' ? value.trim() : '';
  return SLUG_PATTERN.test(slug) ? slug : fallback;
}

/**
 * REST service item to the `Service` view model in a language. German reads the
 * `_de` twins (empty twin: the English value) and points site links in the HTML
 * fields at the German pages. Both slugs are the same in either language.
 */
export function transformService(item: RestService, lang: Lang): Service {
  const localized = localizeRestItem(item, lang);
  const acf: ServiceAcf = isPlainObject(localized.acf_fields) ? localized.acf_fields : {};
  const bodyHtml = (value: unknown) => localizeContentLinks(html(value), lang);
  const title = decodeEntities(rendered(localized.title));

  return {
    id: String(item.id),
    slug: item.slug,
    slugDe: germanSlug(acf.slug_de, item.slug),
    title,
    headline: text(acf.headline) || title,
    eyebrow: text(acf.eyebrow),
    excerpt: rendered(localized.excerpt),
    introHtml: rendered(localized.content),
    seoTitle: text(acf.seo_title),
    seoDescription: text(acf.seo_description),
    sections: asArray<PlainObject>(acf.sections)
      .filter(isPlainObject)
      .map((row) => ({ heading: text(row.heading), bodyHtml: bodyHtml(row.body) }))
      .filter((row) => row.heading !== '' || row.bodyHtml.trim() !== ''),
    faq: asArray<PlainObject>(acf.faq)
      .filter(isPlainObject)
      .map((row) => ({ question: text(row.question), answerHtml: bodyHtml(row.answer) }))
      .filter((row) => row.question !== '' && row.answerHtml.trim() !== ''),
    relatedProjectIds: relationIds(acf.related_projects),
    relatedPostIds: relationIds(acf.related_posts),
    serviceType: text(acf.service_type),
    areaServed: areaKeys(acf.area_served),
    cta: { heading: text(acf.cta_heading), text: text(acf.cta_text), label: text(acf.cta_label) },
    modified: item.modified ?? '',
  };
}
