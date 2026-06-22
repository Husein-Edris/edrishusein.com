// REST-only data fetching with static fallbacks
import { ProjectsResponse, HomepageSections } from '@/src/types/wordpress';
import { rewriteImageUrls } from './image-utils';
import { cmsRest } from './rest-client';
import { transformHomepage } from './transform/transformHomepage';
import { transformProjects, type RestProjectListItem } from './transform/transformProjects';
import { transformPostListItem, type RestPost, type PostListItem } from './transform/transformPost';
import { transformAbout, type RestAboutPage, type AboutPageData } from './transform/transformAbout';

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
    aboutMeText: "I'm a full-stack developer passionate about crafting digital experiences that blend technical excellence with human-centered design. With expertise spanning React, Next.js, WordPress, and modern web technologies, I help businesses transform their ideas into powerful, scalable web solutions. When I'm not coding, you'll find me exploring new technologies, contributing to open source projects, or spending quality time with my family."
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
    email: "kontakt@edrishusein.com"
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

// Fallback data for About page
const FALLBACK_ABOUT_DATA = {
  page: {
    id: "about-fallback",
    title: "About Edris Husein",
    content: "<p>Full-stack developer passionate about creating exceptional digital experiences.</p>",
    featuredImage: {
      node: {
        sourceUrl: "/images/Edris-Husein-Hero.png",
        altText: "Edris Husein Profile",
        mediaDetails: { width: 450, height: 450 }
      }
    },
    aboutPageFields: {
      aboutHeroTitle: "About Edris Husein",
      aboutHeroSubtitle: "Full-stack developer passionate about creating exceptional digital experiences",
      aboutHeroImage: {
        sourceUrl: "/images/Edris-Husein-Hero.png",
        altText: "Edris Husein Profile",
        mediaDetails: { width: 450, height: 450 }
      },
      experienceSectionTitle: "Experience",
      experienceItems: [
        {
          companyName: "Baschnegger Ammann Partner",
          position: "Web Developer",
          duration: "2023 - 2024",
          description: "<p>Built custom WordPress themes and plugins using PHP, JavaScript, and modern CSS.</p>",
          technologies: []
        }
      ],
      skillsSectionTitle: "Skills & Technologies",
      selectedSkills: [],
      personalSectionTitle: "Personal",
      personalContent: "<p>Outside of work, life is never boring. I love spending time with my family and toddler, exploring new tech, and working on personal projects.</p>",
      personalImage: {
        sourceUrl: "/images/Edris-Husein-Hero.png",
        altText: "Edris Husein Personal",
        mediaDetails: { width: 450, height: 450 }
      },
      selectedHobbies: []
    }
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
      return rewriteImageUrls({
        data,
        error: null,
        source: 'wordpress'
      });
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
        const pages = await cmsRest<Array<{ acf_fields?: unknown }>>(
          '/pages?slug=home&acf_format=standard&_embed'
        );

        if (!Array.isArray(pages) || pages.length === 0) {
          throw new Error('No home page returned from WordPress REST');
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Homepage data loaded via REST API');
        }

        return transformHomepage(pages[0]);
      },
      FALLBACK_HOMEPAGE_DATA,
      'Error fetching homepage data'
    );
  }

  static async getProjectsData(limit: number = 6): Promise<FetchResult<ProjectsResponse>> {
    return this.fetchWithFallback<ProjectsResponse>(
      async () => {
        const projects = await cmsRest<RestProjectListItem[]>(
          `/project?_embed&orderby=menu_order&order=asc&acf_format=standard&per_page=${limit}`
        );

        if (!Array.isArray(projects)) {
          throw new Error('Unexpected REST projects response');
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ ${projects.length} projects loaded via REST API`);
        }

        return transformProjects(projects);
      },
      FALLBACK_PROJECTS_DATA,
      'Error fetching projects data'
    );
  }

  static async getPostsData(
    limit: number = 6
  ): Promise<FetchResult<{ posts: { nodes: PostListItem[] } }>> {
    return this.fetchWithFallback(
      async () => {
        const posts = await cmsRest<RestPost[]>(
          `/posts?_embed&per_page=${limit}&orderby=date&order=desc`
        );

        if (!Array.isArray(posts)) {
          throw new Error('Unexpected REST posts response');
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ ${posts.length} posts loaded via REST API`);
        }

        return { posts: { nodes: posts.map(transformPostListItem) } };
      },
      FALLBACK_POSTS_DATA,
      'Error fetching posts data'
    );
  }

  static async getAboutPageData(): Promise<FetchResult<AboutPageData>> {
    return this.fetchWithFallback(
      async () => {
        const pages = await cmsRest<RestAboutPage[]>(
          '/pages?slug=about-me&acf_format=standard&_embed'
        );

        if (!Array.isArray(pages) || pages.length === 0) {
          throw new Error('About page not found in WordPress REST');
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ About page data loaded via REST API');
        }

        return transformAbout(pages[0]);
      },
      FALLBACK_ABOUT_DATA,
      'Error fetching about page data'
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
      this.getProjectsData(3), // Show only 3 newest projects on homepage
      this.getPostsData(3)     // Show only 3 newest posts on homepage
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