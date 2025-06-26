// Enhanced data fetching with error handling and fallbacks
import { client } from './client';
import { GET_HOMEPAGE_DATA, GET_PROJECTS_FOR_GRID } from './queries';
import { discoverWordPressSchema, WORKING_QUERIES } from './schema-discovery';
import { HomepageResponse, ProjectsResponse, HomepageSections } from '@/src/types/wordpress';

// Fallback data when WordPress is unavailable
const FALLBACK_HOMEPAGE_DATA: HomepageSections = {
  heroSection: {
    title: "Edris Husein",
    heroCopy: "Full-stack developer crafting digital experiences with modern technologies.",
    heroImage: {
      node: {
        sourceUrl: "/images/Edris-Husein-Hero.png",
        altText: "Edris Husein Profile",
        mediaDetails: {
          width: 450,
          height: 450
        }
      }
    }
  },
  aboutSection: {
    title: "About Me",
    aboutMeText: "Passionate developer with expertise in React, Next.js, and WordPress development."
  },
  bookshelfSection: {
    title: "BOOKSHELF",
    description: "Books and pieces of wisdom I've enjoyed reading",
    featuredImage: {
      node: {
        sourceUrl: "/images/books-bg.png",
        altText: "Books Background",
        mediaDetails: { width: 400, height: 300 }
      }
    }
  },
  techstackSection: {
    title: "TECH STACK",
    description: "The dev tools, apps, devices, and games I use and play with",
    featuredImage: {
      node: {
        sourceUrl: "/images/tech-bg.png",
        altText: "Tech Background",
        mediaDetails: { width: 400, height: 300 }
      }
    }
  },
  notebookSection: {
    title: "NOTEBOOK"
  },
  contactSection: {
    subTitle: "Get in touch",
    title: "Let's work together",
    email: "hello@edrishusein.com"
  }
};

const FALLBACK_PROJECTS_DATA = {
  projects: {
    nodes: [
      {
        id: "1",
        title: "Sample Project",
        excerpt: "A showcase project demonstrating modern web development techniques.",
        slug: "sample-project",
        featuredImage: {
          node: {
            sourceUrl: "/images/Blog-sample-img.png",
            altText: "Sample Project",
            mediaDetails: { height: 600, width: 800 }
          }
        },
        caseStudy: {
          projectLinks: {
            liveSite: "https://example.com"
          }
        }
      }
    ]
  }
};

export interface FetchResult<T> {
  data: T | null;
  error: string | null;
  source: 'wordpress' | 'fallback';
}

export class DataFetcher {
  private static async fetchWithFallback<T>(
    fetchFn: () => Promise<T>,
    fallbackData: T,
    errorContext: string
  ): Promise<FetchResult<T>> {
    try {
      const data = await fetchFn();
      return {
        data,
        error: null,
        source: 'wordpress'
      };
    } catch (error) {
      console.error(`${errorContext}:`, error);
      
      // In development, log more details
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Using fallback data for ${errorContext}`);
      }

      return {
        data: fallbackData,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'fallback'
      };
    }
  }

  static async getHomepageData(): Promise<FetchResult<HomepageSections>> {
    return this.fetchWithFallback(
      async () => {
        console.log('🔍 Attempting to fetch homepage data from:', process.env.NEXT_PUBLIC_WORDPRESS_API_URL);
        // Try the ACF-based homepage query
        const response: HomepageResponse = await client.request(GET_HOMEPAGE_DATA);
        console.log('✅ WordPress ACF data loaded successfully:', response);
        
        if (!response.page?.homepageSections) {
          console.warn('⚠️ No homepage sections found in response');
          throw new Error('No homepage sections in response');
        }
        
        return response.page.homepageSections;
      },
      FALLBACK_HOMEPAGE_DATA,
      'Error fetching homepage data'
    );
  }

  static async getProjectsData(): Promise<FetchResult<ProjectsResponse>> {
    return this.fetchWithFallback(
      async () => {
        console.log('🔍 Attempting to fetch projects data from:', process.env.NEXT_PUBLIC_WORDPRESS_API_URL);
        // Try the regular projects query
        const response = await client.request(GET_PROJECTS_FOR_GRID);
        console.log('✅ WordPress projects data loaded successfully:', response);
        return response;
      },
      FALLBACK_PROJECTS_DATA,
      'Error fetching projects data'
    );
  }

  // Batch fetch for homepage
  static async getHomepageBundle(): Promise<{
    homepage: FetchResult<HomepageSections>;
    projects: FetchResult<ProjectsResponse>;
  }> {
    const [homepage, projects] = await Promise.allSettled([
      this.getHomepageData(),
      this.getProjectsData()
    ]);

    return {
      homepage: homepage.status === 'fulfilled' 
        ? homepage.value 
        : { data: FALLBACK_HOMEPAGE_DATA, error: 'Failed to fetch', source: 'fallback' },
      projects: projects.status === 'fulfilled' 
        ? projects.value 
        : { data: FALLBACK_PROJECTS_DATA, error: 'Failed to fetch', source: 'fallback' }
    };
  }
}

// Debug helper for development
export function logDataSources(results: Record<string, FetchResult<unknown>>) {
  console.group('🔍 Data Sources');
  Object.entries(results).forEach(([key, result]) => {
    const icon = result.source === 'wordpress' ? '✅' : '⚠️';
    console.log(`${icon} ${key}: ${result.source}`);
    if (result.error) {
      console.warn(`   Error: ${result.error}`);
    }
    if (result.source === 'wordpress' && result.data) {
      console.log(`   Data preview:`, Object.keys(result.data as any));
    }
  });
  console.groupEnd();
}