// Enhanced data fetching with error handling and fallbacks
import { client } from './client';
import { GET_HOMEPAGE_DATA, GET_PROJECTS_FOR_GRID, GET_POSTS_FOR_NOTEBOOK } from './queries';
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
        sourceUrl: "/images/books-bg-optimized.webp",
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
        sourceUrl: "/images/tech-bg-optimized.webp",
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

// Minimal fallback data - WordPress should provide the real content
const FALLBACK_PROJECTS_DATA = {
  projects: {
    nodes: [
      {
        id: "fallback-1",
        title: "WordPress Configuration Required",
        excerpt: "Projects will appear here once WordPress custom post types and ACF fields are properly configured.",
        slug: "wordpress-config-required",
        content: "<p>This is a fallback message. Real project data will come from WordPress once the setup is complete.</p>",
        featuredImage: {
          node: {
            sourceUrl: "/images/Blog-sample-img-optimized.webp",
            altText: "Configuration Required",
            mediaDetails: { height: 600, width: 800 }
          }
        },
        caseStudy: {
          projectContent: {
            challenge: "<p>WordPress needs to be configured with proper custom post types and ACF fields.</p>",
            solution: "<p>Import the ACF configuration and create real project content in WordPress admin.</p>"
          },
          projectLinks: {
            liveSite: ""
          }
        }
      }
    ]
  }
};

const FALLBACK_POSTS_DATA = {
  posts: {
    nodes: [
      {
        id: "1",
        title: "Getting Started with Next.js",
        excerpt: "A comprehensive guide to building modern web applications with Next.js and React.",
        slug: "getting-started-nextjs",
        date: "2024-01-15",
        featuredImage: {
          node: {
            sourceUrl: "/images/Blog-sample-img-optimized.webp",
            altText: "Next.js Blog Post",
            mediaDetails: { height: 400, width: 600 }
          }
        }
      },
      {
        id: "2",
        title: "WordPress Headless CMS",
        excerpt: "Building scalable applications with WordPress as a headless content management system.",
        slug: "wordpress-headless-cms",
        date: "2024-01-10",
        featuredImage: {
          node: {
            sourceUrl: "/images/Blog-sample-img-optimized.webp",
            altText: "WordPress CMS Blog Post",
            mediaDetails: { height: 400, width: 600 }
          }
        }
      },
      {
        id: "3",
        title: "Design Systems in Practice",
        excerpt: "How to implement and maintain consistent design systems across large applications.",
        slug: "design-systems-practice",
        date: "2024-01-05",
        featuredImage: {
          node: {
            sourceUrl: "/images/Blog-sample-img-optimized.webp",
            altText: "Design Systems Blog Post",
            mediaDetails: { height: 400, width: 600 }
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
      if (process.env.NODE_ENV === 'development') {
        console.error(`${errorContext}:`, error);
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
        const response: HomepageResponse = await client.request(GET_HOMEPAGE_DATA);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ WordPress ACF data loaded successfully');
        }
        
        if (!response.page?.homepageSections) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ No homepage sections found in response');
          }
          throw new Error('No homepage sections in response');
        }
        
        return response.page.homepageSections;
      },
      FALLBACK_HOMEPAGE_DATA,
      'Error fetching homepage data'
    );
  }

  static async getProjectsData(limit: number = 6): Promise<FetchResult<ProjectsResponse>> {
    return this.fetchWithFallback<ProjectsResponse>(
      async () => {
        
        // First, try the custom post type query
        const PROJECTS_QUERY = `
          query GetProjects($limit: Int!) {
            projects(first: $limit, where: { orderby: { field: DATE, order: DESC } }) {
              nodes {
                id
                title
                excerpt
                slug
                featuredImage {
                  node {
                    sourceUrl
                    altText
                    mediaDetails {
                      height
                      width
                    }
                  }
                }
                caseStudy {
                  projectLinks {
                    liveSite
                  }
                }
              }
            }
          }
        `;

        try {
          const response = await client.request(PROJECTS_QUERY, { limit });
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ WordPress projects data loaded successfully');
          }
          return response as ProjectsResponse;
        } catch (error: unknown) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ GraphQL projects query failed, trying REST API...');
          }
          
          // Try to get projects via WordPress REST API directly
          try {
            const restResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/project?_embed`);
            
            if (restResponse.ok) {
              const restProjects = await restResponse.json();
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Found ${restProjects.length} projects via REST API`);
              }
              
              // Transform REST API data to match GraphQL structure
              const transformedResponse = {
                projects: {
                  nodes: restProjects.map((project: any) => ({
                    id: project.id.toString(),
                    title: project.title?.rendered || project.title,
                    excerpt: project.excerpt?.rendered || project.excerpt || '',
                    slug: project.slug,
                    featuredImage: project._embedded?.['wp:featuredmedia']?.[0] ? {
                      node: {
                        sourceUrl: project._embedded['wp:featuredmedia'][0].source_url,
                        altText: project._embedded['wp:featuredmedia'][0].alt_text || project.title?.rendered,
                        mediaDetails: {
                          height: project._embedded['wp:featuredmedia'][0].media_details?.height || 600,
                          width: project._embedded['wp:featuredmedia'][0].media_details?.width || 800
                        }
                      }
                    } : {
                      node: {
                        sourceUrl: '/images/Blog-sample-img.png',
                        altText: project.title?.rendered || 'Project Image',
                        mediaDetails: { height: 600, width: 800 }
                      }
                    },
                    caseStudy: {
                      projectLinks: {
                        liveSite: project.acf_fields?.project_links?.live_site || project.acf?.project_links?.live_site || null
                      }
                    }
                  }))
                }
              };
              
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ WordPress REST projects data transformed successfully');
              }
              return transformedResponse as ProjectsResponse;
            }
          } catch (restError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ REST API also failed:', restError instanceof Error ? restError.message : 'Unknown error');
            }
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Both GraphQL and REST API failed for projects');
            console.error('   Using minimal fallback data');
          }
          throw error; // Use fallback data
        }
      },
      FALLBACK_PROJECTS_DATA,
      'Error fetching projects data'
    );
  }

  static async getPostsData(limit: number = 6): Promise<FetchResult<any>> {
    return this.fetchWithFallback(
      async () => {
        
        // Use optimized query with pagination
        const OPTIMIZED_POSTS_QUERY = `
          query GetPosts($limit: Int!) {
            posts(first: $limit, where: { orderby: { field: DATE, order: DESC } }) {
              nodes {
                id
                title
                excerpt
                slug
                date
                featuredImage {
                  node {
                    sourceUrl
                    altText
                    mediaDetails {
                      height
                      width
                    }
                  }
                }
              }
            }
          }
        `;
        
        const response = await client.request(OPTIMIZED_POSTS_QUERY, { limit });
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ WordPress posts data loaded successfully');
        }
        return response;
      },
      FALLBACK_POSTS_DATA,
      'Error fetching posts data'
    );
  }

  // Batch fetch for homepage
  static async getHomepageBundle(): Promise<{
    homepage: FetchResult<HomepageSections>;
    projects: FetchResult<ProjectsResponse>;
    posts: FetchResult<any>;
  }> {
    const [homepage, projects, posts] = await Promise.allSettled([
      this.getHomepageData(),
      this.getProjectsData(),
      this.getPostsData()
    ]);

    return {
      homepage: homepage.status === 'fulfilled' 
        ? homepage.value 
        : { data: FALLBACK_HOMEPAGE_DATA, error: 'Failed to fetch', source: 'fallback' },
      projects: projects.status === 'fulfilled' 
        ? projects.value 
        : { data: FALLBACK_PROJECTS_DATA, error: 'Failed to fetch', source: 'fallback' },
      posts: posts.status === 'fulfilled' 
        ? posts.value 
        : { data: FALLBACK_POSTS_DATA, error: 'Failed to fetch', source: 'fallback' }
    };
  }
}

// Debug helper for development
export function logDataSources(results: Record<string, FetchResult<unknown>>) {
  if (process.env.NODE_ENV === 'development') {
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
}