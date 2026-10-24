import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mockRESTProjects,
  mockRESTPosts,
  mockRESTHomepage,
} from '../__mocks__/fixtures/wordpress-data';
import { DataFetcher } from './data-fetcher';
import { CmsRequestError } from './rest-client';

// Every attempt fails with a 5xx: cmsRest retries, then gives up with a
// transient CmsRequestError (the "CMS is down" case).
const cmsDown = () => mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });
// The CMS answered and the answer was no (permanent, not retried).
const cmsSaysNo = () => mockFetch.mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) });

// The data layer is REST-only; every CMS read goes through global fetch.
const mockFetch = vi.fn();

describe('DataFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
    // Suppress console output in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getHomepageData', () => {
    it('should return WordPress data when REST succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRESTHomepage),
      });

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('wordpress');
      expect(result.error).toBeNull();
      expect(result.data?.aboutSection?.title).toBe('About me');
      expect(result.data?.heroSection?.title).toBe('Edris Husein');
      expect(mockFetch).toHaveBeenCalled();
    });

    it('throws on a transient CMS failure so ISR keeps the last good page', async () => {
      cmsDown();

      await expect(DataFetcher.getHomepageData()).rejects.toBeInstanceOf(CmsRequestError);
    });

    it('should return fallback data when the CMS answers with a 4xx', async () => {
      cmsSaysNo();

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
      expect(result.error).toContain('404');
      expect(result.data?.heroSection?.title).toBe('Edris Husein');
    });

    it('should return fallback when REST returns an empty array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
    });

    describe('testimonials picked on the Home page', () => {
      const homeWithPicks = (ids: unknown) => [
        { ...mockRESTHomepage[0], acf_fields: { ...mockRESTHomepage[0].acf_fields, testimonials_section: { testimonials: ids } } },
      ];
      const ok = (body: unknown) => ({ ok: true, status: 200, json: () => Promise.resolve(body) });

      it('loads the picked testimonials in one request and keeps the picked order', async () => {
        mockFetch
          .mockResolvedValueOnce(ok(homeWithPicks([12, 10])))
          .mockResolvedValueOnce(ok([
            { id: 10, title: { rendered: 'Ten' }, acf_fields: { quote: 'Q10' } },
            { id: 12, title: { rendered: 'Twelve' }, acf_fields: { quote: 'Q12' } },
          ]));

        const result = await DataFetcher.getHomepageData();

        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(String(mockFetch.mock.calls[1][0])).toContain('/testimonial?include=12,10&orderby=include&per_page=100');
        expect(result.data?.testimonialsSection?.items.map((item) => item.name)).toEqual(['Twelve', 'Ten']);
      });

      it('makes no testimonial request when nothing is picked and shows the defaults', async () => {
        mockFetch.mockResolvedValueOnce(ok(homeWithPicks(false)));

        const result = await DataFetcher.getHomepageData();

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(result.data?.testimonialsSection?.items[0].name).toBe('Leon Heuser');
      });

      it('rethrows a transient failure of the testimonial request so ISR keeps the last good page', async () => {
        mockFetch
          .mockResolvedValueOnce(ok(homeWithPicks([1])))
          .mockResolvedValue({ ok: false, status: 503, json: () => Promise.resolve({}) });

        await expect(DataFetcher.getHomepageData()).rejects.toBeInstanceOf(CmsRequestError);
      });

      it('shows the default quotes and keeps the CMS homepage on a permanent failure', async () => {
        mockFetch
          .mockResolvedValueOnce(ok(homeWithPicks([1])))
          .mockResolvedValueOnce({ ok: false, status: 404, json: () => Promise.resolve({}) });

        const result = await DataFetcher.getHomepageData();

        expect(result.source).toBe('wordpress');
        expect(result.data?.testimonialsSection?.items.map((item) => item.name)[0]).toBe('Leon Heuser');
        expect(result.data?.testimonialsSection?.items).toHaveLength(7);
      });
    });
  });

  describe('getProjectsData', () => {
    it('should return WordPress projects when REST succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRESTProjects),
      });

      const result = await DataFetcher.getProjectsData();

      expect(result.source).toBe('wordpress');
      expect(result.error).toBeNull();
      expect(result.data?.projects.nodes).toHaveLength(mockRESTProjects.length);
    });

    it('should pass the limit through as per_page in the REST URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRESTProjects),
      });

      await DataFetcher.getProjectsData(10);

      expect(mockFetch.mock.calls[0][0]).toContain('per_page=10');
    });

    it('throws on a transient CMS failure instead of caching demo projects', async () => {
      cmsDown();

      await expect(DataFetcher.getProjectsData()).rejects.toBeInstanceOf(CmsRequestError);
    });

    it('returns an empty list, never placeholder projects, on a permanent failure', async () => {
      cmsSaysNo();

      const result = await DataFetcher.getProjectsData();

      expect(result.source).toBe('fallback');
      expect(result.data?.projects.nodes).toEqual([]);
    });

    it('should transform REST API data to the domain structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRESTProjects),
      });

      const result = await DataFetcher.getProjectsData();
      const project = result.data?.projects.nodes[0];

      expect(project?.title).toBe('REST Project 1');
      expect(project?.featuredImage?.node?.sourceUrl).toBeDefined();
      expect(project?.caseStudy?.projectLinks?.liveSite).toBe('https://rest-project-1.com');
    });
  });

  describe('getPostsData', () => {
    it('should return WordPress posts when REST succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRESTPosts),
      });

      const result = await DataFetcher.getPostsData();

      expect(result.source).toBe('wordpress');
      expect(result.error).toBeNull();
      expect(result.data?.posts.nodes).toHaveLength(mockRESTPosts.length);
      expect(result.data?.posts.nodes[0].title).toBe('REST Post 1');
    });

    it('should pass the limit through as per_page in the REST URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRESTPosts),
      });

      await DataFetcher.getPostsData(5);

      expect(mockFetch.mock.calls[0][0]).toContain('per_page=5');
    });

    it('returns an empty list, never invented posts, on a permanent failure', async () => {
      cmsSaysNo();

      const result = await DataFetcher.getPostsData();

      expect(result.source).toBe('fallback');
      expect(result.error).toBeDefined();
      expect(result.data?.posts.nodes).toEqual([]);
    });

    it('should handle posts without featured images', async () => {
      const postsWithoutImages = [{
        id: 1,
        title: { rendered: 'No Image Post' },
        excerpt: { rendered: 'Excerpt' },
        slug: 'no-image',
        date: '2024-01-01',
        _embedded: {},
      }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(postsWithoutImages),
      });

      const result = await DataFetcher.getPostsData();
      const post = result.data?.posts.nodes[0];

      expect(post?.featuredImage).toBeNull();
    });
  });

  describe('getHomepageBundle', () => {
    // Homepage, projects and posts are all REST now (mockFetch, in invocation order: home, projects, posts).
    it('should fetch all homepage data in parallel', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTHomepage) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTProjects) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTPosts) });

      const result = await DataFetcher.getHomepageBundle();

      expect(result.homepage.source).toBe('wordpress');
      expect(result.projects.source).toBe('wordpress');
      expect(result.posts.source).toBe('wordpress');
    });

    it('should request the full project list (per_page=20, shared with /projects) and 3 posts', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTHomepage) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTProjects) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTPosts) });

      await DataFetcher.getHomepageBundle();

      const urls = mockFetch.mock.calls.map(c => String(c[0]));
      expect(urls.filter(u => u.includes('/project?') && u.includes('per_page=20'))).toHaveLength(1);
      expect(urls.filter(u => u.includes('/posts?') && u.includes('per_page=3'))).toHaveLength(1);
    });

    it('rejects when one part hits a transient CMS failure, so ISR keeps the last good homepage', async () => {
      mockFetch.mockImplementation((url: string) =>
        String(url).includes('/project?')
          ? Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) })
          : Promise.resolve({
              ok: true,
              json: () => Promise.resolve(String(url).includes('/pages?') ? mockRESTHomepage : mockRESTPosts),
            })
      );

      await expect(DataFetcher.getHomepageBundle()).rejects.toThrow(/503/);
    });

    it('still renders when a part gets a permanent 4xx (empty list, no placeholders)', async () => {
      mockFetch.mockImplementation((url: string) =>
        String(url).includes('/project?')
          ? Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) })
          : Promise.resolve({
              ok: true,
              json: () => Promise.resolve(String(url).includes('/pages?') ? mockRESTHomepage : mockRESTPosts),
            })
      );

      const result = await DataFetcher.getHomepageBundle();

      expect(result.homepage.source).toBe('wordpress');
      expect(result.projects.data?.projects.nodes).toEqual([]);
      expect(result.posts.source).toBe('wordpress');
    });
  });

  describe('FetchResult structure', () => {
    it('should always include source property', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTHomepage) });
      const result = await DataFetcher.getHomepageData();

      expect(result).toHaveProperty('source');
      expect(['wordpress', 'fallback']).toContain(result.source);
    });

    it('should have null error on success', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTProjects) });
      const result = await DataFetcher.getProjectsData();

      expect(result.error).toBeNull();
    });

    it('should have error message on failure', async () => {
      cmsSaysNo();
      const result = await DataFetcher.getHomepageData();

      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    it('should always have data (either real or fallback) when it resolves', async () => {
      cmsSaysNo();
      const result = await DataFetcher.getHomepageData();

      expect(result.data).not.toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle non-Error exceptions', async () => {
      // Rejects on every attempt: cmsRest wraps a non-Error rejection into a
      // transient CmsRequestError with a descriptive message.
      mockFetch.mockRejectedValue('String REST error');

      await expect(DataFetcher.getHomepageData()).rejects.toThrow(/String REST error/);
    });

    it('should handle REST returning undefined', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(undefined) });

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
    });

    it('should throw when the REST API keeps answering 5xx', async () => {
      cmsDown();

      await expect(DataFetcher.getHomepageData()).rejects.toThrow(/500/);
    });
  });

  describe('German pages', () => {
    const ok = (body: unknown) => ({ ok: true, json: () => Promise.resolve(body) });

    it('renders the _de values of the home page and German section defaults', async () => {
      mockFetch.mockResolvedValueOnce(
        ok([
          {
            id: 1,
            acf_fields: {
              hero_section: { hero_title: 'Servus. I build websites', hero_title_de: 'Servus. Ich baue Websites', hero_copy: 'Copy' },
              about_me_section: { title: 'About me', title_de: '' },
            },
          },
        ])
      );

      const result = await DataFetcher.getHomepageData('de');

      expect(result.data?.heroSection?.heading).toBe('Servus. Ich baue Websites');
      expect(result.data?.heroSection?.heroCopy).toBe('Copy');
      expect(result.data?.aboutSection?.title).toBe('About me');
      expect(result.data?.notebookSection?.title).toBe('NOTIZBUCH');
      expect(result.data?.testimonialsSection?.title).toBe('Das sagen Kunden');
    });

    it('renders project titles from title_de, English when empty', async () => {
      mockFetch.mockResolvedValueOnce(
        ok([
          { ...mockRESTProjects[0], acf_fields: { title_de: 'Projekt eins' } },
          { ...mockRESTProjects[0], id: 2, slug: 'two', acf_fields: { title_de: '' } },
        ])
      );

      const result = await DataFetcher.getProjectsData(20, 'de');

      expect(result.data?.projects.nodes.map((node) => node.title)).toEqual(['Projekt eins', 'REST Project 1']);
    });

    it('labels a post German when it has content_de, else keeps the detected language', async () => {
      mockFetch.mockResolvedValueOnce(
        ok([
          {
            ...mockRESTPosts[0],
            title: { rendered: 'Why the build is slow and how to fix it' },
            acf_fields: { title_de: 'Warum der Build langsam ist', content_de: '<p>Der Text auf Deutsch.</p>' },
          },
          { ...mockRESTPosts[0], id: 2, slug: 'en-only', title: { rendered: 'This is only in English and it is fine' } },
        ])
      );

      const result = await DataFetcher.getPostsData(3, 'de');
      const [german, english] = result.data?.posts.nodes ?? [];

      expect(german.title).toBe('Warum der Build langsam ist');
      expect(german.language).toBe('de');
      expect(english.title).toBe('This is only in English and it is fine');
      expect(english.language).toBe('en');
    });

    it('leaves English pages on the original text', async () => {
      mockFetch.mockResolvedValueOnce(ok([{ ...mockRESTProjects[0], acf_fields: { title_de: 'Projekt eins' } }]));

      const result = await DataFetcher.getProjectsData(20);

      expect(result.data?.projects.nodes[0].title).toBe('REST Project 1');
    });
  });
});
