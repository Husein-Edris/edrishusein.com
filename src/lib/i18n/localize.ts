import type { Lang } from './lang';
import { SITE_URL, localePath } from './paths';

// German text from the CMS. Every ACF text field `x` has a sibling `x_de` in the
// same object of REST `acf_fields` (groups and repeater rows included), and the
// core fields title/excerpt/content have acf_fields.title_de / excerpt_de /
// content_de. An empty `_de` value means "not translated yet": the English value
// renders instead, so a German page is never blank.

const DE_SUFFIX = '_de';

type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function germanText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

/**
 * Deep copy of an ACF value with each field `x` replaced by its non-empty `x_de`.
 * Only fields that exist are replaced, so `title_de` next to no `title` adds
 * nothing. The input is never mutated.
 */
export function localizeAcf<T>(value: T): T {
  if (Array.isArray(value)) return value.map((entry) => localizeAcf(entry)) as T;
  if (!isPlainObject(value)) return value;

  const out: PlainObject = {};
  for (const [key, entry] of Object.entries(value)) {
    const german = key.endsWith(DE_SUFFIX) ? null : germanText(value[`${key}${DE_SUFFIX}`]);
    out[key] = german ?? localizeAcf(entry);
  }
  return out as T;
}

// href="/path" or href="https://edrishusein.com/path" in CMS HTML; file links
// (anything with an extension in the last segment) are left alone.
const SITE_LINK = new RegExp(`(href=["'])(?:${SITE_URL.replace(/[.]/g, '\\.')})?(/[^"'#?]*)([^"']*["'])`, 'g');

/** Point the site links inside CMS HTML at the pages of `lang` (German: /de/...). */
export function localizeContentLinks(html: string, lang: Lang): string {
  if (lang !== 'de') return html;
  return html.replace(SITE_LINK, (match, open: string, path: string, rest: string) => {
    if (path.startsWith('//') || /\.[a-z0-9]+$/i.test(path)) return match;
    const localized = localePath(path, lang);
    return match.startsWith(`${open}${SITE_URL}`) ? `${open}${SITE_URL}${localized}${rest}` : `${open}${localized}${rest}`;
  });
}

function withRendered(field: unknown, text: string | null): unknown {
  if (text === null) return field;
  if (isPlainObject(field)) return { ...field, rendered: text };
  return text;
}

function withLocalizedLinks(field: unknown, lang: Lang): unknown {
  if (typeof field === 'string') return localizeContentLinks(field, lang);
  if (isPlainObject(field) && typeof field.rendered === 'string') {
    return { ...field, rendered: localizeContentLinks(field.rendered, lang) };
  }
  return field;
}

/**
 * A WordPress REST item (post, project, page, tech, book, hobby, skill) in a
 * language. For German: title/excerpt/content from acf_fields.*_de when filled,
 * and every ACF text field from its `_de` sibling. English returns the item.
 */
export function localizeRestItem<T>(item: T, lang: Lang): T {
  if (lang !== 'de' || !isPlainObject(item)) return item;

  const acf = item.acf_fields;
  const translations = isPlainObject(acf) ? acf : {};
  const out: PlainObject = { ...item };

  for (const field of ['title', 'excerpt', 'content'] as const) {
    if (field in item) out[field] = withRendered(item[field], germanText(translations[`${field}${DE_SUFFIX}`]));
  }
  // Site links inside the body point at the German pages.
  if ('content' in item) out.content = withLocalizedLinks(out.content, lang);
  if ('acf_fields' in item) out.acf_fields = localizeAcf(acf);
  if ('acf' in item) out.acf = localizeAcf(item.acf);

  return out as T;
}

/** True when a REST item carries a German body (acf_fields.content_de). */
export function hasTranslatedContent(item: unknown): boolean {
  if (!isPlainObject(item) || !isPlainObject(item.acf_fields)) return false;
  return germanText(item.acf_fields[`content${DE_SUFFIX}`]) !== null;
}

/**
 * The flat Site Content response in a language: for German each key takes its
 * non-empty `<key>_de`, otherwise keeps the English value. Code defaults for
 * blank keys are applied afterwards (transformSiteContent).
 */
export function localizeSiteContent(raw: unknown, lang: Lang): Record<string, unknown> {
  const source: PlainObject = isPlainObject(raw) ? raw : {};
  if (lang !== 'de') return source;

  const out: PlainObject = { ...source };
  for (const [key, value] of Object.entries(source)) {
    const german = key.endsWith(DE_SUFFIX) ? germanText(value) : null;
    if (german !== null) out[key.slice(0, -DE_SUFFIX.length)] = german;
  }
  return out;
}
