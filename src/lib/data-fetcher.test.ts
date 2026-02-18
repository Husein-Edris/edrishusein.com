import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mockHomepageResponse,
  mockProjectsResponse,
  mockPostsResponse,
  mockAboutPageResponse,
  mockRESTProjects,
  mockRESTPosts,
  mockRESTHomepage,
} from '../__mocks__/fixtures/wordpress-data';

// Mock the GraphQL client - use vi.hoisted to create mock before vi.mock
const { mockRequest } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
}));

vi.mock('./client', () => ({
  client: {
    request: mockRequest,
  },
}));

// Import after mock setup
import { DataFetcher, logDataSources } from './data-fetcher';

// Mock fetch for REST API fallback
const mockFetch = vi.fn();

describe('DataFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest.mockReset();
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
    it('should return WordPress data when GraphQL succeeds', async () => {
      mockRequest.mockResolvedValueOnce(mockHomepageResponse);

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('wordpress');
      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.aboutSection).toBeDefined();
    });

    it('should fall back to REST API when GraphQL fails', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRESTHomepage),
      });

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('wordpress');
      expect(result.data).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should return fallback data when both GraphQL and REST fail', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
      mockFetch.mockRejectedValueOnce(new Error('REST error'));

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
      expect(result.error).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data?.heroSection?.title).toBe('Edris Husein');
    });

    it('should throw when GraphQL returns no homepage sections', async () => {
      mockRequest.mockResolvedValueOnce({ page: { homepageSections: null } });
      mockFetch.mockRejectedValueOnce(new Error('REST error'));

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
    });

    it('should handle REST API returning empty array', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
    });
  });

  describe('getProjectsData', () => {
    it('should return WordPress projects when GraphQL succeeds', async () => {
      mockRequest.mockResolvedValueOnce(mockProjectsResponse);

      const result = await DataFetcher.getProjectsData();

      expect(result.source).toBe('wordpress');
      expect(result.error).toBeNull();
      expect(result.data?.projects.nodes).toHaveLength(2);
    });

    it('should accept custom limit parameter', async () => {
      mockRequest.mockResolvedValueOnce(mockProjectsResponse);

      await DataFetcher.getProjectsData(10);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.any(String),
        { limit: 10 }
      );
    });

    it('should fall back to REST API when GraphQL fails', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRESTProjects),
      });

      const result = await DataFetcher.getProjectsData();

      expect(result.source).toBe('wordpress');
      expect(result.data?.projects.nodes).toBeDefined();
    });

    it('should return fallback data when both APIs fail', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
      mockFetch.mockRejectedValueOnce(new Error('REST error'));

      const result = await DataFetcher.getProjectsData();

      expect(result.source).toBe('fallback');
      expect(result.error).toBeDefined();
      expect(result.data?.projects.nodes).toBeDefined();
    });

    it('should transform REST API data to match GraphQL structure', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRESTProjects),
      });

      const result = await DataFetcher.getProjectsData();
      const project = result.data?.projects.nodes[0];

      expect(project?.title).toBe('REST Project 1');
      expect(project?.featuredImage?.node?.sourceUrl).toBeDefined();
    });
  });

  describe('getPostsData', () => {
    it('should return WordPress posts when GraphQL succeeds', async () => {
      mockRequest.mockResolvedValueOnce(mockPostsResponse);

      const result = await DataFetcher.getPostsData();

      expect(result.source).toBe('wordpress');
      expect(result.error).toBeNull();
      expect(result.data?.posts.nodes).toHaveLength(3);
    });

    it('should accept custom limit parameter', async () => {
      mockRequest.mockResolvedValueOnce(mockPostsResponse);

      await DataFetcher.getPostsData(5);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.any(String),
        { limit: 5 }
      );
    });

    it('should fall back to REST API when GraphQL fails', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRESTPosts),
      });

      const result = await DataFetcher.getPostsData();

      expect(result.source).toBe('wordpress');
      expect(result.data?.posts.nodes).toBeDefined();
    });

    it('should return fallback data when both APIs fail', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
      mockFetch.mockRejectedValueOnce(new Error('REST error'));

      const result = await DataFetcher.getPostsData();

      expect(result.source).toBe('fallback');
      expect(result.error).toBeDefined();
      expect(result.data?.posts.nodes).toHaveLength(3);
    });

    it('should handle posts without featured images', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
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
    it('should return WordPress about data when GraphQL succeeds', async () => {
      mockRequest.mockResolvedValueOnce(mockAboutPageResponse);

      const result = await DataFetcher.getAboutPageData();

      expect(result.source).toBe('wordpress');
      expect(result.error).toBeNull();
      expect(result.data?.page?.aboutPageFields).toBeDefined();
    });

    it('should fall back to REST API when GraphQL fails', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{
          id: 1,
          title: { rendered: 'About Me' },
          content: { rendered: '<p>About content</p>' },
          _embedded: {},
          acf: {
            about_hero_title: 'REST About Title',
          },
        }]),
      });

      const result = await DataFetcher.getAboutPageData();

      expect(result.source).toBe('wordpress');
      expect(result.data?.page).toBeDefined();
    });

    it('should return fallback data when both APIs fail', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
      mockFetch.mockRejectedValueOnce(new Error('REST error'));

      const result = await DataFetcher.getAboutPageData();

      expect(result.source).toBe('fallback');
      expect(result.error).toBeDefined();
      expect(result.data?.page?.aboutPageFields).toBeDefined();
    });
  });

  describe('getHomepageBundle', () => {
    it('should fetch all homepage data in parallel', async () => {
      mockRequest
        .mockResolvedValueOnce(mockHomepageResponse)
        .mockResolvedValueOnce(mockProjectsResponse)
        .mockResolvedValueOnce(mockPostsResponse);

      const result = await DataFetcher.getHomepageBundle();

      expect(result.homepage.source).toBe('wordpress');
      expect(result.projects.source).toBe('wordpress');
      expect(result.posts.source).toBe('wordpress');
    });

    it('should use limit of 3 for projects and posts', async () => {
      mockRequest
        .mockResolvedValueOnce(mockHomepageResponse)
        .mockResolvedValueOnce(mockProjectsResponse)
        .mockResolvedValueOnce(mockPostsResponse);

      await DataFetcher.getHomepageBundle();

      // Check that the projects and posts queries were called with limit 3
      const calls = mockRequest.mock.calls;
      const hasProjectsLimit3 = calls.some(call => call[1]?.limit === 3);
      expect(hasProjectsLimit3).toBe(true);
    });

    it('should handle partial failures gracefully', async () => {
      mockRequest
        .mockResolvedValueOnce(mockHomepageResponse)
        .mockRejectedValueOnce(new Error('Projects failed'))
        .mockResolvedValueOnce(mockPostsResponse);
      mockFetch.mockRejectedValueOnce(new Error('REST also failed'));

      const result = await DataFetcher.getHomepageBundle();

      expect(result.homepage.source).toBe('wordpress');
      expect(result.projects.source).toBe('fallback');
      expect(result.posts.source).toBe('wordpress');
    });

    it('should return fallback for all if all requests fail', async () => {
      mockRequest
        .mockRejectedValueOnce(new Error('Homepage failed'))
        .mockRejectedValueOnce(new Error('Projects failed'))
        .mockRejectedValueOnce(new Error('Posts failed'));
      mockFetch.mockRejectedValue(new Error('REST failed'));

      const result = await DataFetcher.getHomepageBundle();

      expect(result.homepage.source).toBe('fallback');
      expect(result.projects.source).toBe('fallback');
      expect(result.posts.source).toBe('fallback');
    });
  });

  describe('FetchResult structure', () => {
    it('should always include source property', async () => {
      mockRequest.mockResolvedValueOnce(mockHomepageResponse);
      const result = await DataFetcher.getHomepageData();

      expect(result).toHaveProperty('source');
      expect(['wordpress', 'fallback']).toContain(result.source);
    });

    it('should have null error on success', async () => {
      mockRequest.mockResolvedValueOnce(mockProjectsResponse);
      const result = await DataFetcher.getProjectsData();

      expect(result.error).toBeNull();
    });

    it('should have error message on failure', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Test error'));
      mockFetch.mockRejectedValueOnce(new Error('REST error'));
      const result = await DataFetcher.getHomepageData();

      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    it('should always have data (either real or fallback)', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Error'));
      mockFetch.mockRejectedValueOnce(new Error('REST error'));
      const result = await DataFetcher.getHomepageData();

      expect(result.data).not.toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle non-Error exceptions', async () => {
      mockRequest.mockRejectedValueOnce('String error');
      mockFetch.mockRejectedValueOnce('String REST error');

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
      expect(result.error).toBe('Unknown error');
    });

    it('should handle undefined response from GraphQL', async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      mockFetch.mockRejectedValueOnce(new Error('REST error'));

      const result = await DataFetcher.getHomepageData();

      expect(result.source).toBe('fallback');
    });

    it('should handle REST API returning non-ok status', async () => {
      mockRequest.mockRejectedValueOnce(new Error('GraphQL error'));
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
