// The two site languages. English is the default and lives at unprefixed URLs;
// German lives under /de with the same paths and slugs (decision 2026-10-24).
export const LANGS = ['en', 'de'] as const;

export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'en';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/** Open Graph locale per language. */
export const OG_LOCALE: Readonly<Record<Lang, string>> = { en: 'en_US', de: 'de_AT' };

/** Intl locale for dates per language. */
export const DATE_LOCALE: Readonly<Record<Lang, string>> = { en: 'en-US', de: 'de-AT' };

export function otherLang(lang: Lang): Lang {
  return lang === 'de' ? 'en' : 'de';
}
