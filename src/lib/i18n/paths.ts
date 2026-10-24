import { DEFAULT_LANG, type Lang } from './lang';

export const SITE_URL = 'https://edrishusein.com';

const GERMAN_PREFIX = '/de';
// /en/... is never a public URL (the proxy 308s it to the unprefixed path), but
// it is the internal path of every English page, so it is stripped as well.
const LOCALE_SEGMENT = /^\/(en|de)(?=\/|$)/;

/** Site paths start with one slash; mailto:, tel:, absolute, anchor and // links do not. */
function isSitePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

/** "/de/about" -> { lang: 'de', path: '/about' }; unprefixed paths are English. */
export function stripLocale(pathname: string | null | undefined): { lang: Lang; path: string } {
  const value = pathname || '/';
  const match = LOCALE_SEGMENT.exec(value);
  if (!match) return { lang: DEFAULT_LANG, path: value };
  const rest = value.slice(match[0].length);
  return { lang: match[1] as Lang, path: rest === '' ? '/' : rest };
}

/**
 * The URL of a site path in a language: English unprefixed, German under /de.
 * Idempotent (never "/de/de/...") and converts a path from one language to the
 * other. Anything that is not a site path is returned unchanged.
 */
export function localePath(path: string, lang: Lang): string {
  if (!isSitePath(path)) return path;
  const cut = path.search(/[?#]/);
  const pathname = cut === -1 ? path : path.slice(0, cut);
  const suffix = cut === -1 ? '' : path.slice(cut);
  const base = stripLocale(pathname).path;
  if (lang === DEFAULT_LANG) return `${base}${suffix}`;
  return `${base === '/' ? GERMAN_PREFIX : `${GERMAN_PREFIX}${base}`}${suffix}`;
}

export interface LanguageAlternates {
  canonical: string;
  languages: { en: string; de: string; 'x-default': string };
}

/**
 * Next metadata `alternates` for a page pair: canonical in the page's own
 * language, hreflang en/de, and x-default on the English page. Relative paths;
 * the root layout's metadataBase makes them absolute.
 */
export function alternatesFor(path: string, lang: Lang = DEFAULT_LANG): LanguageAlternates {
  const base = stripLocale(path).path;
  return {
    canonical: localePath(base, lang),
    languages: { en: localePath(base, 'en'), de: localePath(base, 'de'), 'x-default': localePath(base, 'en') },
  };
}

/** Absolute public URL of a site path in a language (homepage without a trailing slash). */
export function absoluteUrl(path: string, lang: Lang = DEFAULT_LANG): string {
  const localized = localePath(path, lang);
  return localized === '/' ? SITE_URL : `${SITE_URL}${localized}`;
}
