import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  getServiceRelations,
  getServices,
  getServicesOrEmpty,
  resolveServiceSlug,
  serviceAlternates,
  servicePath,
  servicesForProject,
  SERVICES_REST_PATH,
} from './services';
import { transformService, type RestService, type Service } from './transform/transformService';

const fixture: RestService = JSON.parse(
  readFileSync(resolve(__dirname, 'transform/__fixtures__/service.json'), 'utf-8'),
);

const redesign: Service = transformService(fixture, 'en');
const headless: Service = { ...redesign, id: '7', slug: 'headless-wordpress-nextjs', slugDe: 'headless-wordpress-nextjs' };
const services = [redesign, headless];

describe('servicePath', () => {
  it('uses the English slug unprefixed and the German slug under /de', () => {
    expect(servicePath(redesign, 'en')).toBe('/services/website-redesign');
    expect(servicePath(redesign, 'de')).toBe('/de/services/website-relaunch');
  });
});

describe('serviceAlternates', () => {
  it('pairs the two different slugs with x-default on the English page', () => {
    expect(serviceAlternates(redesign, 'de')).toEqual({
      canonical: '/de/services/website-relaunch',
      languages: {
        en: '/services/website-redesign',
        de: '/de/services/website-relaunch',
        'x-default': '/services/website-redesign',
      },
    });
  });

  it('sets the canonical to the page language', () => {
    expect(serviceAlternates(redesign, 'en').canonical).toBe('/services/website-redesign');
  });
});

describe('resolveServiceSlug', () => {
  it('returns the service and its canonical slug for the page language', () => {
    expect(resolveServiceSlug('en', 'website-redesign', services)).toEqual({ service: redesign, slug: 'website-redesign' });
    expect(resolveServiceSlug('de', 'website-relaunch', services)).toEqual({ service: redesign, slug: 'website-relaunch' });
  });

  it('returns a redirect target when the other language slug is requested', () => {
    expect(resolveServiceSlug('de', 'website-redesign', services)).toEqual({
      service: redesign,
      slug: 'website-relaunch',
      redirectTo: '/de/services/website-relaunch',
    });
    expect(resolveServiceSlug('en', 'website-relaunch', services)).toEqual({
      service: redesign,
      slug: 'website-redesign',
      redirectTo: '/services/website-redesign',
    });
  });

  it('does not redirect when both languages share one slug', () => {
    expect(resolveServiceSlug('de', 'headless-wordpress-nextjs', services)).toEqual({
      service: headless,
      slug: 'headless-wordpress-nextjs',
    });
  });

  it('returns null for an unknown slug', () => {
    expect(resolveServiceSlug('en', 'woocommerce-shop', services)).toBeNull();
    expect(resolveServiceSlug('de', '', services)).toBeNull();
    expect(resolveServiceSlug('en', 'website-redesign', [])).toBeNull();
  });
});

describe('getServices', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests the service list in menu order with acf_fields and ISR caching', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([fixture]) });

    await getServices('en');

    const [url, init] = mockFetch.mock.calls[0];
    expect(SERVICES_REST_PATH).toContain('orderby=menu_order');
    expect(SERVICES_REST_PATH).toContain('acf_fields');
    expect(url).toMatch(/\/wp-json\/wp\/v2\/service\?per_page=20&orderby=menu_order&order=asc/);
    expect(init.next).toEqual({ revalidate: 60 });
    expect(init.cache).toBeUndefined();
  });

  it('returns view models in the requested language', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([fixture]) });

    const [en] = await getServices('en');
    const [de] = await getServices('de');

    expect(en.headline).toBe('Website redesign without starting from zero');
    expect(de.headline).toBe('Website-Relaunch in Vorarlberg');
  });

  it('rethrows a transient CMS failure so ISR keeps the last good render', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });

    await expect(getServices('en')).rejects.toMatchObject({ name: 'CmsRequestError', isTransient: true });
  });

  it('returns no services when the CMS answers no (post type not deployed yet)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: () => Promise.resolve({}) });

    await expect(getServices('en')).resolves.toEqual([]);
  });

  it('logs a permanent failure with its context instead of dropping it silently', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: () => Promise.resolve({}) });

    await getServices('en');

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching services'),
      expect.stringContaining('(404) for /service?'),
    );
  });

  it('does not log a transient failure, it propagates', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503, json: () => Promise.resolve({}) });

    await expect(getServices('en')).rejects.toMatchObject({ isTransient: true });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('returns no services for a non-array answer', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ code: 'rest_no_route' }) });

    await expect(getServices('de')).resolves.toEqual([]);
  });
});

describe('getServicesOrEmpty', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the services when the CMS answers', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([fixture]) });

    await expect(getServicesOrEmpty('en')).resolves.toHaveLength(1);
  });

  it('never throws: a CMS outage returns no services and is logged', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });

    await expect(getServicesOrEmpty('de')).resolves.toEqual([]);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('shared chrome'), expect.stringContaining('500'));
  });
});

describe('servicesForProject', () => {
  it('returns the services that list the project, in service order', () => {
    const maintenance: Service = { ...redesign, id: '8', slug: 'wordpress-maintenance', relatedProjectIds: [102, 103] };
    const unrelated: Service = { ...headless, relatedProjectIds: [] };
    expect(servicesForProject([redesign, unrelated, maintenance], 102)).toEqual([redesign, maintenance]);
    expect(servicesForProject([redesign, maintenance], 103)).toEqual([maintenance]);
  });

  it('returns nothing for an unlisted project or an empty service list', () => {
    expect(servicesForProject(services, 999)).toEqual([]);
    expect(servicesForProject([], 101)).toEqual([]);
    expect(servicesForProject(services, Number.NaN)).toEqual([]);
  });
});

describe('getServiceRelations', () => {
  const mockFetch = vi.fn();

  const projectItems = [
    {
      id: 102,
      slug: 'fhe-gastro-website-relaunch',
      title: { rendered: 'FHE Gastro &#8211; relaunch' },
      excerpt: { rendered: '<p>Gastro relaunch.</p>' },
      acf_fields: { title_de: 'FHE Gastro Relaunch', excerpt_de: 'Relaunch für FHE Gastro.' },
    },
    {
      id: 101,
      slug: 'illwerke-vkw-website-relaunch',
      title: { rendered: 'illwerke vkw' },
      excerpt: { rendered: '<p>Energy.</p>' },
      acf_fields: { title_de: '', excerpt_de: '' },
    },
  ];
  const postItems = [{ id: 201, slug: 'website-relaunch-checklist', title: { rendered: 'Checklist' }, acf_fields: false }];

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const respond = () =>
    mockFetch.mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(url.includes('/project?') ? projectItems : postItems),
      }),
    );

  it('fetches only the related ids, with the fields the page needs', async () => {
    respond();

    await getServiceRelations(redesign, 'en');

    const urls = mockFetch.mock.calls.map(([url]) => url as string);
    expect(urls).toHaveLength(2);
    expect(urls.find((url) => url.includes('/project?'))).toMatch(/include=101,102&/);
    expect(urls.find((url) => url.includes('/posts?'))).toMatch(/include=201&/);
    for (const url of urls) expect(url).toContain('acf_fields.title_de');
  });

  it('keeps the editor order of the relationship field and links in the page language', async () => {
    respond();

    const en = await getServiceRelations(redesign, 'en');
    expect(en.projects.map((link) => link.path)).toEqual([
      '/projects/illwerke-vkw-website-relaunch',
      '/projects/fhe-gastro-website-relaunch',
    ]);
    expect(en.projects[1].title).toBe('FHE Gastro \u2013 relaunch');
    expect(en.posts).toEqual([
      { id: 201, title: 'Checklist', excerpt: '', path: '/notebook/website-relaunch-checklist' },
    ]);

    const de = await getServiceRelations(redesign, 'de');
    expect(de.projects[1]).toMatchObject({ title: 'FHE Gastro Relaunch', path: '/de/projects/fhe-gastro-website-relaunch' });
    expect(de.projects[0].title).toBe('illwerke vkw');
  });

  it('makes no request when the service has no relations', async () => {
    const bare: Service = { ...redesign, relatedProjectIds: [], relatedPostIds: [] };

    await expect(getServiceRelations(bare, 'en')).resolves.toEqual({ projects: [], posts: [] });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rethrows a transient failure so the page is not cached without its proof', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 502, json: () => Promise.resolve({}) });

    await expect(getServiceRelations(redesign, 'en')).rejects.toMatchObject({ isTransient: true });
  });

  it('logs a permanent failure and renders the page without that block', async () => {
    mockFetch.mockImplementation((url: string) =>
      Promise.resolve(
        url.includes('/posts?')
          ? { ok: false, status: 400, json: () => Promise.resolve({}) }
          : { ok: true, json: () => Promise.resolve(projectItems) },
      ),
    );

    const result = await getServiceRelations(redesign, 'en');

    expect(result.projects).toHaveLength(2);
    expect(result.posts).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('related posts'), expect.stringContaining('400'));
  });
});
