// REST-only data fetching with static fallbacks
import { ProjectsResponse, HomepageSections } from '@/src/types/wordpress';
import { rewriteImageUrls } from './image-utils';
import { cmsRest, isTransientCmsError } from './rest-client';
import { transformHomepage } from './transform/transformHomepage';
import {
  transformTestimonials,
  selectedTestimonialIds,
  type RestTestimonialPost,
} from './transform/transformTestimonials';
import { transformProjects, type RestProjectListItem } from './transform/transformProjects';
import { localizedPostListItem, type RestPost, type PostListItem } from './transform/transformPost';
import { localizeRestItem } from './i18n/localize';
import { DEFAULT_LANG, type Lang } from './i18n/lang';

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

// A permanent CMS answer (4xx, unexpected shape) renders an empty list, never
// placeholder entries: demo projects and invented posts used to reach production
// this way. Transient failures do not get here at all (see fetchWithFallback).
const FALLBACK_PROJECTS_DATA: ProjectsResponse = { projects: { nodes: [] } };

const FALLBACK_POSTS_DATA: { posts: { nodes: PostListItem[] } } = { posts: { nodes: [] } };

// The testimonials picked on the Home page, in one request. A transient CMS
// failure rethrows (ISR keeps the last good page); a permanent one (e.g. the
// testimonial post type not deployed yet) returns none, so the section shows
// its code defaults while the rest of the homepage still renders.
async function fetchSelectedTestimonials(ids: number[]): Promise<RestTestimonialPost[]> {
  if (ids.length === 0) return [];
  try {
    const posts = await cmsRest<RestTestimonialPost[]>(
      `/testimonial?include=${ids.join(',')}&orderby=include&per_page=100&_fields=id,title,acf_fields`
    );
    return Array.isArray(posts) ? posts : [];
  } catch (error) {
    if (isTransientCmsError(error)) throw error;
    if (process.env.NODE_ENV === 'development') {
      console.warn('Testimonials not loaded, using defaults:', error);
    }
    return [];
  }
}

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
      // The CMS could not answer: throw so Next ISR keeps serving the last good
      // render. A fallback returned here would be cached for the whole
      // revalidate window (same rule as the detail pages, PR #21).
      if (isTransientCmsError(error)) {
        throw error;
      }

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

  // Every getter takes the page language. The CMS request is the same for both
  // languages (one cached response); German text is picked from the
  // `<field>_de` values after the fetch (src/lib/i18n/localize.ts).
  static async getHomepageData(lang: Lang = DEFAULT_LANG): Promise<FetchResult<HomepageSections>> {
    return this.fetchWithFallback(
      async () => {
        const pages = await cmsRest<Array<{ acf_fields?: unknown }>>(
          '/pages?slug=home&acf_format=standard&_embed'
        );

        if (!Array.isArray(pages) || pages.length === 0) {
          throw new Error('No home page returned from WordPress REST');
        }


        const page = localizeRestItem(pages[0], lang);
        const acfFields = page.acf_fields;
        const testimonials = await fetchSelectedTestimonials(selectedTestimonialIds(acfFields));

        return {
          ...transformHomepage(page, lang),
          testimonialsSection: transformTestimonials(acfFields, testimonials, lang),
        };
      },
      FALLBACK_HOMEPAGE_DATA,
      'Error fetching homepage data'
    );
  }

  static async getProjectsData(limit: number = 6, lang: Lang = DEFAULT_LANG): Promise<FetchResult<ProjectsResponse>> {
    return this.fetchWithFallback<ProjectsResponse>(
      async () => {
        const projects = await cmsRest<RestProjectListItem[]>(
          `/project?_embed&orderby=menu_order&order=asc&acf_format=standard&per_page=${limit}`
        );

        if (!Array.isArray(projects)) {
          throw new Error('Unexpected REST projects response');
        }


        return transformProjects(projects.map((project) => localizeRestItem(project, lang)));
      },
      FALLBACK_PROJECTS_DATA,
      'Error fetching projects data'
    );
  }

  static async getPostsData(
    limit: number = 6,
    lang: Lang = DEFAULT_LANG
  ): Promise<FetchResult<{ posts: { nodes: PostListItem[] } }>> {
    return this.fetchWithFallback(
      async () => {
        const posts = await cmsRest<RestPost[]>(
          `/posts?_embed&per_page=${limit}&orderby=date&order=desc`
        );

        if (!Array.isArray(posts)) {
          throw new Error('Unexpected REST posts response');
        }


        return { posts: { nodes: posts.map((post) => localizedPostListItem(post, lang)) } };
      },
      FALLBACK_POSTS_DATA,
      'Error fetching posts data'
    );
  }

  // Batch fetch for homepage. Promise.all, not allSettled: a transient CMS
  // failure in any part must reject the render so ISR keeps the last good page.
  static async getHomepageBundle(lang: Lang = DEFAULT_LANG): Promise<{
    homepage: FetchResult<HomepageSections>;
    projects: FetchResult<ProjectsResponse>;
    posts: FetchResult<{ posts: { nodes: PostListItem[] } }>;
  }> {
    const [homepage, projects, posts] = await Promise.all([
      this.getHomepageData(lang),
      // Same request as /projects (shared data cache): the hero strip picks from
      // the full list, the projects section then shows three (section-registry).
      this.getProjectsData(20, lang),
      this.getPostsData(3, lang),    // Show only 3 newest posts on homepage
    ]);

    return { homepage, projects, posts };
  }
}
