import { decodeEntities } from './transform/decodeEntities';

// German landing page (/de). The rest of the site is English; this page is the
// German entry point for local search ("WordPress Entwickler Vorarlberg").
// Title and body come from a regular WordPress page so Edris can edit them in
// wp-admin; meta title/description live in app/de/page.tsx like every other
// page's metadata.

const SITE_URL = 'https://edrishusein.com';

export const GERMAN_LANDING_PATH = '/de';
export const GERMAN_LANDING_SLUG = 'wordpress-entwickler-vorarlberg';

// hreflang pairs, used by both the homepage and /de so each names the other.
export const LANGUAGE_ALTERNATES = {
  en: '/',
  de: GERMAN_LANDING_PATH,
  'x-default': '/',
} as const;

export interface RestPage {
  id: number | string;
  date?: string;
  modified?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
}

export interface GermanLanding {
  title: string;
  content: string;
  modified?: string;
}

// Null when the page is unusable, so the route can 404 rather than render (and
// ISR-cache) an empty landing page.
export function toGermanLanding(page: RestPage): GermanLanding | null {
  const title = decodeEntities(page.title?.rendered ?? '').trim();
  const content = page.content?.rendered ?? '';
  if (!title || !content.trim()) return null;

  return { title, content, modified: page.modified || page.date };
}

export function germanLandingStructuredData({ title, description }: { title: string; description: string }): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${GERMAN_LANDING_PATH}#webpage`,
    url: `${SITE_URL}${GERMAN_LANDING_PATH}`,
    name: title,
    description,
    inLanguage: 'de-AT',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#service` },
  };
}
