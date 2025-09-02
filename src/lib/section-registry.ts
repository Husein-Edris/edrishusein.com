// Section registry for dynamic section rendering
import { HomepageSections, TransformedProject, InfoCardData } from '@/src/types/wordpress';

// Component types
export type ComponentType = 'hero' | 'about' | 'projects' | 'infocards' | 'contact';

// Section configuration type
export interface SectionConfig {
  id: string;
  component: ComponentType;
  props: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

// Helper to create section configs
export function createSectionConfig(
  id: string,
  component: ComponentType,
  props: Record<string, unknown>,
  order: number = 0,
  enabled: boolean = true
): SectionConfig {
  return { id, component, props, order, enabled };
}

// Section data transformers
export class SectionTransformers {
  static transformProjects(projects: unknown[]): TransformedProject[] {
    if (!Array.isArray(projects)) return [];
    
    return projects.map((project: any) => ({
      title: project.title || 'Untitled Project',
      description: project.excerpt || 'No description available',
      image: project.featuredImage?.node?.sourceUrl,
      variant: 'dark' as const,
      visitLink: project.caseStudy?.projectLinks?.liveSite || null,
      caseStudyLink: project.slug ? `/projects/${project.slug}` : '#'
    }));
  }

  static transformPosts(posts: unknown[]): InfoCardData[] {
    if (!Array.isArray(posts)) return [];
    
    return posts.map((post: any) => ({
      title: post.title || 'Untitled Post',
      description: post.excerpt || 'No description available',
      image: post.featuredImage?.node?.sourceUrl || '/images/Blog-sample-img.png',
      link: post.slug ? `/notebook/${post.slug}` : '#',
      variant: 'light' as const
    }));
  }

  static createStaticInfoCards(): InfoCardData[] {
    return [
      {
        title: "BOOKSHELF",
        description: "Books and pieces of wisdom I've enjoyed reading",
        image: "/images/books-bg.png",
        link: "/bookshelf"
      },
      {
        title: "TECH STACK",
        description: "The dev tools, apps, devices, and games I use and play with",
        image: "/images/tech-bg.png",
        link: "/tech-stack"
      }
    ];
  }

  static createInfoCardsFromACF(homepageData: HomepageSections | null): InfoCardData[] {
    if (!homepageData) return this.createStaticInfoCards();

    const cards: InfoCardData[] = [];

    // Add bookshelf card if data exists
    if (homepageData.bookshelfSection) {
      cards.push({
        title: homepageData.bookshelfSection.title || "BOOKSHELF",
        description: homepageData.bookshelfSection.description || "Books and pieces of wisdom I've enjoyed reading",
        image: homepageData.bookshelfSection.featuredImage?.node?.sourceUrl || "/images/books-bg.png",
        link: "/bookshelf"
      });
    }

    // Add tech stack card if data exists
    if (homepageData.techstackSection) {
      cards.push({
        title: homepageData.techstackSection.title || "TECH STACK",
        description: homepageData.techstackSection.description || "The dev tools, apps, devices, and games I use and play with",
        image: homepageData.techstackSection.featuredImage?.node?.sourceUrl || "/images/tech-bg.png",
        link: "/tech-stack"
      });
    }

    // Return static cards if no ACF data found
    return cards.length > 0 ? cards : this.createStaticInfoCards();
  }
}

// Section factory for creating homepage sections
export class SectionFactory {
  static createHomepageSections(
    homepageData: HomepageSections | null,
    projectsData: unknown,
    postsData: unknown
  ): SectionConfig[] {
    const projectNodes = (projectsData as any)?.projects?.nodes || [];
    const transformedProjects = SectionTransformers.transformProjects(projectNodes);
    
    const postNodes = (postsData as any)?.posts?.nodes || [];
    const transformedPosts = SectionTransformers.transformPosts(postNodes);

    return [
      createSectionConfig('hero', 'hero', {
        data: homepageData?.heroSection
      }, 1),

      createSectionConfig('projects', 'projects', {
        skin: 'projects',
        variant: 'dark',
        sectionNumber: '01',
        sectionTitle: 'Projects',
        columns: 3,
        cards: transformedProjects,
        viewMoreLink: '/projects',
        viewMoreText: 'VIEW ALL PROJECTS'
      }, 2),

      createSectionConfig('about', 'about', {
        data: homepageData?.aboutSection
      }, 3),

      createSectionConfig('info-cards', 'infocards', {
        skin: 'default',
        variant: 'dark',
        columns: 2,
        cards: SectionTransformers.createInfoCardsFromACF(homepageData)
      }, 4),

      createSectionConfig('notebook', 'infocards', {
        skin: 'blog',
        variant: 'light',
        sectionNumber: '03',
        sectionTitle: homepageData?.notebookSection?.title || 'NOTEBOOK',
        columns: 3,
        cards: transformedPosts,
        viewMoreLink: '/notebook',
        viewMoreText: 'VIEW ALL ARTICLES'
      }, 5),

      createSectionConfig('contact', 'contact', {
        data: homepageData?.contactSection
      }, 6)
    ].filter(section => section.enabled);
  }
}