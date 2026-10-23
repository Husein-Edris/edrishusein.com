import { describe, it, expect } from 'vitest';
import {
  GERMAN_LANDING_PATH,
  GERMAN_LANDING_SLUG,
  LANGUAGE_ALTERNATES,
  toGermanLanding,
  germanLandingStructuredData,
} from './german-landing';

describe('toGermanLanding', () => {
  it('decodes the title and keeps the content HTML as is', () => {
    const page = toGermanLanding({
      id: 7,
      modified: '2026-10-23T10:00:00',
      title: { rendered: 'WordPress&#8209;Entwickler &amp; mehr' },
      content: { rendered: '<p>Servus &amp; hallo</p>' },
    });

    expect(page).toEqual({
      title: 'WordPress‑Entwickler & mehr',
      content: '<p>Servus &amp; hallo</p>',
      modified: '2026-10-23T10:00:00',
    });
  });

  it('returns null when the CMS page has no content, so the route 404s instead of rendering an empty page', () => {
    expect(toGermanLanding({ id: 7, title: { rendered: 'X' }, content: { rendered: '  ' } })).toBeNull();
    expect(toGermanLanding({ id: 7, title: { rendered: 'X' } })).toBeNull();
  });

  it('returns null when the title is missing', () => {
    expect(toGermanLanding({ id: 7, title: { rendered: '' }, content: { rendered: '<p>x</p>' } })).toBeNull();
  });
});

describe('LANGUAGE_ALTERNATES', () => {
  it('points en and x-default at the homepage and de at the German page', () => {
    expect(LANGUAGE_ALTERNATES).toEqual({
      en: '/',
      de: '/de',
      'x-default': '/',
    });
    expect(GERMAN_LANDING_PATH).toBe('/de');
    expect(GERMAN_LANDING_SLUG).toBeTruthy();
  });
});

describe('germanLandingStructuredData', () => {
  it('describes a German WebPage about the ProfessionalService', () => {
    const data = germanLandingStructuredData({
      title: 'WordPress-Entwickler in Vorarlberg',
      description: 'Beschreibung',
    }) as Record<string, unknown>;

    expect(data['@type']).toBe('WebPage');
    expect(data.url).toBe('https://edrishusein.com/de');
    expect(data.inLanguage).toBe('de-AT');
    expect(data.name).toBe('WordPress-Entwickler in Vorarlberg');
    expect(data.about).toEqual({ '@id': 'https://edrishusein.com/#service' });
    expect(data.isPartOf).toEqual({ '@id': 'https://edrishusein.com/#website' });
  });
});
