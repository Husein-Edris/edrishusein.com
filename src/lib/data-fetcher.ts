// Enhanced data fetching with error handling and fallbacks
import { client } from './client';
import { GET_HOMEPAGE_DATA, GET_PROJECTS_FOR_GRID, GET_POSTS_FOR_NOTEBOOK, GET_ABOUT_PAGE_DATA } from './queries';
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
    aboutPageFieldsNew: {
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
        try {
          const response: HomepageResponse = await client.request(GET_HOMEPAGE_DATA);
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ WordPress ACF data loaded successfully');
          }
          
          if (!response.page?.homepageSections) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ No homepage sections found in GraphQL response, trying REST API...');
            }
            throw new Error('No homepage sections in GraphQL response');
          }
          
          // Combine WordPress About section with fallback data for other sections
          const wpSections = response.page.homepageSections;
          return {
            ...FALLBACK_HOMEPAGE_DATA,
            aboutSection: wpSections.aboutSection || FALLBACK_HOMEPAGE_DATA.aboutSection
          };
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ GraphQL homepage query failed, trying REST API...');
          }
          
          // Try WordPress REST API as fallback
          try {
            const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';
            
            // Fetch homepage data from REST API
            const restResponse = await fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/pages?slug=home&acf_format=standard`, {
              cache: 'no-store'
            });
            
            if (restResponse.ok) {
              const restPages = await restResponse.json();
              
              if (restPages && restPages.length > 0) {
                const homePage = restPages[0];
                
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Found homepage data via REST API');
                }
                
                // Transform REST API data to match GraphQL structure
                const transformedData: HomepageSections = {
                  heroSection: {
                    title: homePage.acf?.hero_title || FALLBACK_HOMEPAGE_DATA.heroSection.title,
                    heroCopy: homePage.acf?.hero_copy || FALLBACK_HOMEPAGE_DATA.heroSection.heroCopy,
                    heroImage: homePage.acf?.hero_image ? {
                      node: {
                        sourceUrl: homePage.acf.hero_image.url || homePage.acf.hero_image.source_url,
                        altText: homePage.acf.hero_image.alt || homePage.acf.hero_image.alt_text || 'Hero Image',
                        mediaDetails: {
                          width: homePage.acf.hero_image.width || 450,
                          height: homePage.acf.hero_image.height || 450
                        }
                      }
                    } : FALLBACK_HOMEPAGE_DATA.heroSection.heroImage
                  },
                  aboutSection: {
                    title: homePage.acf?.about_title || FALLBACK_HOMEPAGE_DATA.aboutSection.title,
                    aboutMeText: homePage.acf?.about_text || FALLBACK_HOMEPAGE_DATA.aboutSection.aboutMeText
                  },
                  bookshelfSection: {
                    title: homePage.acf?.bookshelf_title || FALLBACK_HOMEPAGE_DATA.bookshelfSection?.title,
                    description: homePage.acf?.bookshelf_description || FALLBACK_HOMEPAGE_DATA.bookshelfSection?.description,
                    featuredImage: homePage.acf?.bookshelf_image ? {
                      node: {
                        sourceUrl: homePage.acf.bookshelf_image.url || homePage.acf.bookshelf_image.source_url,
                        altText: homePage.acf.bookshelf_image.alt || homePage.acf.bookshelf_image.alt_text || 'Bookshelf',
                        mediaDetails: {
                          width: homePage.acf.bookshelf_image.width || 400,
                          height: homePage.acf.bookshelf_image.height || 300
                        }
                      }
                    } : FALLBACK_HOMEPAGE_DATA.bookshelfSection?.featuredImage
                  },
                  techstackSection: {
                    title: homePage.acf?.techstack_title || FALLBACK_HOMEPAGE_DATA.techstackSection?.title,
                    description: homePage.acf?.techstack_description || FALLBACK_HOMEPAGE_DATA.techstackSection?.description,
                    featuredImage: homePage.acf?.techstack_image ? {
                      node: {
                        sourceUrl: homePage.acf.techstack_image.url || homePage.acf.techstack_image.source_url,
                        altText: homePage.acf.techstack_image.alt || homePage.acf.techstack_image.alt_text || 'Tech Stack',
                        mediaDetails: {
                          width: homePage.acf.techstack_image.width || 400,
                          height: homePage.acf.techstack_image.height || 300
                        }
                      }
                    } : FALLBACK_HOMEPAGE_DATA.techstackSection?.featuredImage
                  },
                  notebookSection: {
                    title: homePage.acf?.notebook_title || FALLBACK_HOMEPAGE_DATA.notebookSection?.title
                  },
                  contactSection: {
                    subTitle: homePage.acf?.contact_subtitle || FALLBACK_HOMEPAGE_DATA.contactSection?.subTitle,
                    title: homePage.acf?.contact_title || FALLBACK_HOMEPAGE_DATA.contactSection?.title,
                    email: homePage.acf?.contact_email || FALLBACK_HOMEPAGE_DATA.contactSection?.email
                  }
                };
                
                return transformedData;
              }
            }
          } catch (restError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ REST API also failed:', restError instanceof Error ? restError.message : 'Unknown error');
            }
          }
          
          throw error; // Use fallback data
        }
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
                        liveSite: project.acf_fields?.project_links?.live_site || project.acf?.project_links?.live_site || project.acf_fields?.live_site || project.acf?.live_site || null
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
        
        try {
          const response = await client.request(OPTIMIZED_POSTS_QUERY, { limit });
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ WordPress posts data loaded successfully');
          }
          return response;
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ GraphQL posts query failed, trying REST API...');
          }
          
          // Try WordPress REST API as fallback
          try {
            const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';
            
            const restResponse = await fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/posts?_embed&per_page=${limit}`, {
              cache: 'no-store'
            });
            
            if (restResponse.ok) {
              const restPosts = await restResponse.json();
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Found ${restPosts.length} posts via REST API`);
              }
              
              // Transform REST API data to match GraphQL structure
              const transformedResponse = {
                posts: {
                  nodes: restPosts.map((post: any) => ({
                    id: post.id.toString(),
                    title: post.title?.rendered || post.title,
                    excerpt: post.excerpt?.rendered || post.excerpt || '',
                    slug: post.slug,
                    date: post.date,
                    featuredImage: post._embedded?.['wp:featuredmedia']?.[0] ? {
                      node: {
                        sourceUrl: post._embedded['wp:featuredmedia'][0].source_url,
                        altText: post._embedded['wp:featuredmedia'][0].alt_text || post.title?.rendered || '',
                        mediaDetails: {
                          width: post._embedded['wp:featuredmedia'][0].media_details?.width || 400,
                          height: post._embedded['wp:featuredmedia'][0].media_details?.height || 400
                        }
                      }
                    } : null
                  }))
                }
              };
              
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ WordPress REST posts data transformed successfully');
              }
              return transformedResponse;
            }
          } catch (restError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ REST API also failed:', restError instanceof Error ? restError.message : 'Unknown error');
            }
          }
          
          throw error; // Use fallback data
        }
      },
      FALLBACK_POSTS_DATA,
      'Error fetching posts data'
    );
  }

  static async getAboutPageData(): Promise<FetchResult<any>> {
    return this.fetchWithFallback(
      async () => {
        try {
          const response = await client.request(GET_ABOUT_PAGE_DATA);
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ WordPress about page data loaded successfully');
          }
          return response;
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ GraphQL about page query failed, trying REST API...');
          }
          
          // Try WordPress REST API as fallback
          try {
            const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';
            
            const restResponse = await fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/pages?slug=about-me&acf_format=standard`, {
              cache: 'no-store'
            });
            
            if (restResponse.ok) {
              const restPages = await restResponse.json();
              
              if (restPages && restPages.length > 0) {
                const aboutPage = restPages[0];
                
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Found about page data via REST API');
                }
                
                // Transform REST API data to match GraphQL structure
                const transformedData = {
                  page: {
                    id: aboutPage.id.toString(),
                    title: aboutPage.title?.rendered || aboutPage.title,
                    content: aboutPage.content?.rendered || aboutPage.content,
                    featuredImage: aboutPage._embedded?.['wp:featuredmedia']?.[0] ? {
                      node: {
                        sourceUrl: aboutPage._embedded['wp:featuredmedia'][0].source_url,
                        altText: aboutPage._embedded['wp:featuredmedia'][0].alt_text || aboutPage.title?.rendered || '',
                        mediaDetails: {
                          width: aboutPage._embedded['wp:featuredmedia'][0].media_details?.width || 450,
                          height: aboutPage._embedded['wp:featuredmedia'][0].media_details?.height || 450
                        }
                      }
                    } : FALLBACK_ABOUT_DATA.page.featuredImage,
                    aboutPageFieldsNew: {
                      aboutHeroTitle: aboutPage.acf?.about_hero_title || FALLBACK_ABOUT_DATA.page.aboutPageFieldsNew.aboutHeroTitle,
                      aboutHeroSubtitle: aboutPage.acf?.about_hero_subtitle || FALLBACK_ABOUT_DATA.page.aboutPageFieldsNew.aboutHeroSubtitle,
                      aboutHeroImage: aboutPage.acf?.about_hero_image ? {
                        sourceUrl: aboutPage.acf.about_hero_image.url || aboutPage.acf.about_hero_image.source_url,
                        altText: aboutPage.acf.about_hero_image.alt || aboutPage.acf.about_hero_image.alt_text || 'About Hero Image',
                        mediaDetails: {
                          width: aboutPage.acf.about_hero_image.width || 450,
                          height: aboutPage.acf.about_hero_image.height || 450
                        }
                      } : FALLBACK_ABOUT_DATA.page.aboutPageFieldsNew.aboutHeroImage,
                      experienceSectionTitle: aboutPage.acf?.experience_section_title || FALLBACK_ABOUT_DATA.page.aboutPageFieldsNew.experienceSectionTitle,
                      experienceItems: aboutPage.acf?.experience_items || FALLBACK_ABOUT_DATA.page.aboutPageFieldsNew.experienceItems,
                      skillsSectionTitle: aboutPage.acf?.skills_section_title || FALLBACK_ABOUT_DATA.page.aboutPageFieldsNew.skillsSectionTitle,
                      selectedSkills: aboutPage.acf?.selected_skills || FALLBACK_ABOUT_DATA.page.aboutPageFieldsNew.selectedSkills,
                      personalSectionTitle: aboutPage.acf?.personal_section_title || FALLBACK_ABOUT_DATA.page.aboutPageFieldsNew.personalSectionTitle,
                      personalContent: aboutPage.acf?.personal_content || FALLBACK_ABOUT_DATA.page.aboutPageFieldsNew.personalContent,
                      personalImage: aboutPage.acf?.personal_image ? {
                        sourceUrl: aboutPage.acf.personal_image.url || aboutPage.acf.personal_image.source_url,
                        altText: aboutPage.acf.personal_image.alt || aboutPage.acf.personal_image.alt_text || 'Personal Image',
                        mediaDetails: {
                          width: aboutPage.acf.personal_image.width || 450,
                          height: aboutPage.acf.personal_image.height || 450
                        }
                      } : FALLBACK_ABOUT_DATA.page.aboutPageFieldsNew.personalImage,
                      selectedHobbies: aboutPage.acf?.selected_hobbies || FALLBACK_ABOUT_DATA.page.aboutPageFieldsNew.selectedHobbies
                    }
                  }
                };
                
                return transformedData;
              }
            }
          } catch (restError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ REST API also failed:', restError instanceof Error ? restError.message : 'Unknown error');
            }
          }
          
          throw error; // Use fallback data
        }
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