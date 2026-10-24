import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSiteContent, getSiteContentOrDefaults, SITE_CONTENT_URL } from './site-content';
import { SITE_CONTENT_DEFAULTS, SITE_CONTENT_DEFAULTS_DE } from './transform/transformSiteContent';
import { CmsRequestError } from './rest-client';

const mockFetch = vi.fn();

describe('getSiteContent', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads the theme route outside the wp/v2 namespace', () => {
    expect(SITE_CONTENT_URL).toMatch(/\/wp-json\/headless\/v1\/site-content$/);
  });

  it('returns the CMS values with defaults for empty fields', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ contact_page_heading: 'Write me', contact_page_intro: '' }),
    });

    const content = await getSiteContent();

    expect(mockFetch).toHaveBeenCalledWith(SITE_CONTENT_URL, expect.objectContaining({ next: { revalidate: 60 } }));
    expect(content.contactPage.heading).toBe('Write me');
    expect(content.contactPage.intro).toBe(SITE_CONTENT_DEFAULTS.contactPage.intro);
  });

  it('renders the code defaults when the route does not exist yet (404)', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) });

    await expect(getSiteContent()).resolves.toEqual(SITE_CONTENT_DEFAULTS);
  });

  it('rethrows a transient CMS failure so ISR keeps the last good page', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });

    await expect(getSiteContent()).rejects.toBeInstanceOf(CmsRequestError);
  });
});

describe('getSiteContentOrDefaults', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the CMS values when the route answers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ cookie_banner_accept_label: 'Allow' }),
    });

    const content = await getSiteContentOrDefaults();

    expect(content.cookieBanner.acceptLabel).toBe('Allow');
    expect(content.cookieBanner.rejectLabel).toBe('Reject all');
  });

  it('renders the code defaults instead of throwing on a transient CMS failure', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });

    await expect(getSiteContentOrDefaults()).resolves.toEqual(SITE_CONTENT_DEFAULTS);
  });
});

describe('getSiteContent in German', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads <key>_de, then the English value, then the German default', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          nav_about: 'About',
          nav_about_de: 'Über uns',
          footer_imprint_label: 'Legal notice',
          footer_imprint_label_de: '',
          nav_projects: '',
          nav_projects_de: '',
        }),
    });

    const content = await getSiteContent('de');

    expect(content.nav.about).toBe('Über uns');
    expect(content.footer.imprintLabel).toBe('Legal notice');
    expect(content.nav.projects).toBe('Projekte');
  });

  it('renders the German defaults when the route is missing or the CMS is down', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) });
    await expect(getSiteContent('de')).resolves.toEqual(SITE_CONTENT_DEFAULTS_DE);

    mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });
    await expect(getSiteContentOrDefaults('de')).resolves.toEqual(SITE_CONTENT_DEFAULTS_DE);
  });
});
