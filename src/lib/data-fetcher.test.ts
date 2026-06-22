import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mockRESTProjects,
  mockRESTPosts,
  mockRESTHomepage,
} from '../__mocks__/fixtures/wordpress-data';
import { DataFetcher, logDataSources } from './data-fetcher';

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

    it('should return fallback data when REST fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('REST error'));

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
      expect(result.error).toBeDefined();
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

    it('should return fallback when REST responds non-ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
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

    it('should return fallback data when REST fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('REST error'));

      const result = await DataFetcher.getProjectsData();

      expect(result.source).toBe('fallback');
      expect(result.error).toBeDefined();
      expect(result.data?.projects.nodes).toBeDefined();
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

    it('should return fallback data when REST fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('REST error'));

      const result = await DataFetcher.getPostsData();

      expect(result.source).toBe('fallback');
      expect(result.error).toBeDefined();
      expect(result.data?.posts.nodes).toHaveLength(3);
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

  describe('getAboutPageData', () => {
    it('should return WordPress about data when REST succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{
          id: 1,
          title: { rendered: 'About Me' },
          content: { rendered: '<p>About content</p>' },
          _embedded: {},
          acf_fields: {
            about_hero_title: 'REST About Title',
            selected_skills: [{ ID: 1, post_title: 'Adaptability' }],
          },
        }]),
      });

      const result = await DataFetcher.getAboutPageData();

      expect(result.source).toBe('wordpress');
      expect(result.error).toBeNull();
      expect(result.data?.page?.aboutPageFields).toBeDefined();
      expect(result.data?.page?.aboutPageFields.aboutHeroTitle).toBe('REST About Title');
      expect(result.data?.page?.aboutPageFields.skillsSection.selectedSkills).toHaveLength(1);
    });

    it('should return fallback data when REST fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('REST error'));

      const result = await DataFetcher.getAboutPageData();

      expect(result.source).toBe('fallback');
      expect(result.error).toBeDefined();
      expect(result.data?.page?.aboutPageFields).toBeDefined();
    });

    it('should return fallback when REST returns an empty array', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

      const result = await DataFetcher.getAboutPageData();

      expect(result.source).toBe('fallback');
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

    it('should request 3 projects and 3 posts (per_page=3) for the homepage', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTHomepage) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTProjects) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTPosts) });

      await DataFetcher.getHomepageBundle();

      const perPage3 = mockFetch.mock.calls.filter(c => String(c[0]).includes('per_page=3'));
      expect(perPage3.length).toBe(2); // projects + posts
    });

    it('should handle partial failures gracefully', async () => {
      // home REST ok; projects REST fails; posts REST ok
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTHomepage) })
        .mockRejectedValueOnce(new Error('Projects REST failed'))
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRESTPosts) });

      const result = await DataFetcher.getHomepageBundle();

      expect(result.homepage.source).toBe('wordpress');
      expect(result.projects.source).toBe('fallback');
      expect(result.posts.source).toBe('wordpress');
    });

    it('should return fallback for all if all requests fail', async () => {
      mockFetch.mockRejectedValue(new Error('REST failed'));

      const result = await DataFetcher.getHomepageBundle();

      expect(result.homepage.source).toBe('fallback');
      expect(result.projects.source).toBe('fallback');
      expect(result.posts.source).toBe('fallback');
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
      mockFetch.mockRejectedValueOnce(new Error('REST error'));
      const result = await DataFetcher.getHomepageData();

      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    it('should always have data (either real or fallback)', async () => {
      mockFetch.mockRejectedValueOnce(new Error('REST error'));
      const result = await DataFetcher.getHomepageData();

      expect(result.data).not.toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('String REST error');

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
      expect(result.error).toBe('Unknown error');
    });

    it('should handle REST returning undefined', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(undefined) });

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
    });

    it('should handle REST API returning non-ok status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
    });
  });

  describe('logDataSources', () => {
    it('should log data sources in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      vi.stubEnv('NODE_ENV', 'development');

      const mockResults = {
        homepage: { data: {}, error: null, source: 'wordpress' as const },
        projects: { data: {}, error: 'test error', source: 'fallback' as const },
      };

      logDataSources(mockResults);

      expect(console.group).toHaveBeenCalledWith('🔍 Data Sources');
      expect(console.groupEnd).toHaveBeenCalled();

      vi.stubEnv('NODE_ENV', originalNodeEnv || 'test');
    });

    it('should not log in production mode', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const mockResults = {
        homepage: { data: {}, error: null, source: 'wordpress' as const },
      };

      logDataSources(mockResults);

      expect(console.group).not.toHaveBeenCalled();
    });
  });
});
