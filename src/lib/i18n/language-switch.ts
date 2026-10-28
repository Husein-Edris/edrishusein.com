import { localePath, stripLocale } from './paths';
import type { Lang } from './lang';

// Kept free of server imports: the Header (a client component) uses it.

/** The two URL slugs of one service page. */
export interface ServiceSlugPair {
  en: string;
  de: string;
}

const SERVICE_PATH = /^\/services\/([^/]+)$/;

/**
 * Target of the Header language switch: the same page in the other language.
 * Most pages share a path across languages; service pages have a slug per
 * language, so the switch links the other slug directly instead of relying on
 * the proxy's crossed-slug redirect.
 */
export function languageSwitchPath(pathname: string, targetLang: Lang, serviceSlugs: ServiceSlugPair[]): string {
  const { lang, path } = stripLocale(pathname);
  const slug = SERVICE_PATH.exec(path)?.[1];
  const pair = slug ? serviceSlugs.find((candidate) => candidate[lang] === slug) : undefined;
  return localePath(pair ? `/services/${pair[targetLang]}` : path, targetLang);
}
