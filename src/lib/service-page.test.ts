import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadServicePage, loadServicesIndex, serviceMetadata, serviceStaticParams } from './service-page';
import { transformService, type RestService } from './transform/transformService';

const fixture: RestService = JSON.parse(
  readFileSync(resolve(__dirname, 'transform/__fixtures__/service.json'), 'utf-8'),
);

const mockFetch = vi.fn();

const answer = (body: unknown) => mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(body) });
const fail = (status: number) => mockFetch.mockResolvedValue({ ok: false, status, json: () => Promise.resolve({}) });

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('serviceStaticParams', () => {
  it('prerenders each service under the slug of the page language', async () => {
    answer([fixture]);

    await expect(serviceStaticParams('en')).resolves.toEqual([{ slug: 'website-redesign' }]);
    await expect(serviceStaticParams('de')).resolves.toEqual([{ slug: 'website-relaunch' }]);
  });

  it('prerenders nothing when the CMS has no services (post type not deployed)', async () => {
    fail(404);
    await expect(serviceStaticParams('en')).resolves.toEqual([]);

    answer([]);
    await expect(serviceStaticParams('de')).resolves.toEqual([]);
  });

  it('lets a CMS outage fail the build instead of prerendering nothing', async () => {
    fail(500);
    await expect(serviceStaticParams('en')).rejects.toMatchObject({ isTransient: true });
  });
});

describe('loadServicePage', () => {
  it('returns the page for the slug of its language', async () => {
    answer([fixture]);

    const result = await loadServicePage('de', 'website-relaunch');

    expect(result.kind).toBe('page');
    if (result.kind === 'page') expect(result.service.headline).toBe('Website-Relaunch in Vorarlberg');
  });

  it('is not found for the other language slug, which the proxy redirects before the page', async () => {
    answer([fixture]);

    await expect(loadServicePage('de', 'website-redesign')).resolves.toEqual({ kind: 'not-found' });
    await expect(loadServicePage('en', 'website-relaunch')).resolves.toEqual({ kind: 'not-found' });
  });

  it('is not found only for a genuinely unknown slug or an empty CMS', async () => {
    answer([fixture]);
    await expect(loadServicePage('en', 'woocommerce-shop')).resolves.toEqual({ kind: 'not-found' });

    fail(404);
    await expect(loadServicePage('en', 'website-redesign')).resolves.toEqual({ kind: 'not-found' });
  });

  it('propagates a CMS outage instead of turning it into a 404', async () => {
    fail(503);
    await expect(loadServicePage('en', 'website-redesign')).rejects.toMatchObject({ isTransient: true });
  });
});

describe('loadServicesIndex', () => {
  it('returns the services in menu order', async () => {
    answer([fixture]);

    const services = await loadServicesIndex('en');

    expect(services?.map((service) => service.slug)).toEqual(['website-redesign']);
  });

  it('returns null with zero services so the index 404s instead of an empty, indexable shell', async () => {
    answer([]);
    await expect(loadServicesIndex('en')).resolves.toBeNull();

    fail(404);
    await expect(loadServicesIndex('de')).resolves.toBeNull();
  });

  it('propagates a CMS outage', async () => {
    fail(500);
    await expect(loadServicesIndex('en')).rejects.toMatchObject({ isTransient: true });
  });
});

describe('serviceMetadata', () => {
  const de = transformService(fixture, 'de');
  const en = transformService(fixture, 'en');

  it('uses the SEO fields of the page language', () => {
    const metadata = serviceMetadata(de, 'de');

    expect(metadata.title).toBe('Website-Relaunch in Vorarlberg | Edris Husein');
    expect(metadata.description).toMatch(/^Relaunch für veraltete Websites/);
  });

  it('declares a self-canonical and hreflang pairs with the per-language slugs', () => {
    expect(serviceMetadata(de, 'de').alternates).toEqual({
      canonical: '/de/services/website-relaunch',
      languages: {
        en: '/services/website-redesign',
        de: '/de/services/website-relaunch',
        'x-default': '/services/website-redesign',
      },
    });
    expect(serviceMetadata(en, 'en').alternates?.canonical).toBe('/services/website-redesign');
  });

  it('sets Open Graph url and locale per language', () => {
    const og = serviceMetadata(de, 'de').openGraph as Record<string, unknown>;

    expect(og.url).toBe('/de/services/website-relaunch');
    expect(og.locale).toBe('de_AT');
    expect(og.alternateLocale).toEqual(['en_US']);
  });

  it('falls back to "<title> | Edris Husein" and the excerpt when the SEO fields are empty', () => {
    const bare = { ...en, seoTitle: '', seoDescription: '' };
    const metadata = serviceMetadata(bare, 'en');

    expect(metadata.title).toBe('Website redesign | Edris Husein');
    expect(metadata.description).toBe('Redesign an outdated website without losing the search traffic you already have.');
  });
});
