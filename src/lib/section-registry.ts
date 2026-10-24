// Section registry for dynamic section rendering
import { HomepageSections, TransformedProject, InfoCardData } from '@/src/types/wordpress';
import { buildHeroCopyLinks, buildHeroFrames } from '@/src/lib/hero-frames';
import { cmsText } from '@/src/lib/cms-text';
import { localePath } from '@/src/lib/i18n/paths';
import { DEFAULT_LANG, type Lang } from '@/src/lib/i18n/lang';

// Code defaults of the homepage teaser cards and the notebook section, shown
// while the matching Home page fields are empty.
const HOME_DEFAULTS = {
  en: {
    bookshelfTitle: 'BOOKSHELF',
    bookshelfDescription: "Books and pieces of wisdom I've enjoyed reading",
    techStackTitle: 'TECH STACK',
    techStackDescription: 'The dev tools, apps, devices, and games I use and play with',
    notebookTitle: 'NOTEBOOK',
    notebookViewAll: 'VIEW ALL ARTICLES',
    untitledProject: 'Untitled Project',
    untitledPost: 'Untitled Post',
    noDescription: 'No description available',
  },
  de: {
    bookshelfTitle: 'BÜCHERREGAL',
    bookshelfDescription: 'Bücher und Gedanken, die ich gerne gelesen habe',
    techStackTitle: 'TECHNOLOGIEN',
    techStackDescription: 'Die Entwicklungswerkzeuge, Apps, Geräte und Spiele, die ich nutze',
    notebookTitle: 'NOTIZBUCH',
    notebookViewAll: 'ALLE ARTIKEL ANSEHEN',
    untitledProject: 'Projekt ohne Titel',
    untitledPost: 'Beitrag ohne Titel',
    noDescription: 'Keine Beschreibung vorhanden',
  },
} as const;

// Component types
export type ComponentType = 'hero' | 'about' | 'projects' | 'infocards' | 'testimonials' | 'contact';

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
  static transformProjects(projects: unknown[], lang: Lang = DEFAULT_LANG): TransformedProject[] {
    if (!Array.isArray(projects)) return [];
    const text = HOME_DEFAULTS[lang];
    
    return projects.map((project: any) => ({
      title: project.title || text.untitledProject,
      description: project.excerpt || text.noDescription,
      image: project.featuredImage?.node?.sourceUrl,
      variant: 'dark' as const,
      visitLink: project.caseStudy?.projectLinks?.liveSite || null,
      caseStudyLink: project.slug ? localePath(`/projects/${project.slug}`, lang) : '#'
    }));
  }

  static transformPosts(posts: unknown[], lang: Lang = DEFAULT_LANG): InfoCardData[] {
    if (!Array.isArray(posts)) return [];
    const text = HOME_DEFAULTS[lang];
    
    return posts.map((post: any) => ({
      title: post.title || text.untitledPost,
      description: post.excerpt || text.noDescription,
      image: post.featuredImage?.node?.sourceUrl || '/images/Blog-sample-img-optimized.webp',
      link: post.slug ? localePath(`/notebook/${post.slug}`, lang) : '#',
      variant: 'light' as const
    }));
  }

  static createStaticInfoCards(lang: Lang = DEFAULT_LANG): InfoCardData[] {
    const text = HOME_DEFAULTS[lang];
    return [
      {
        title: text.bookshelfTitle,
        description: text.bookshelfDescription,
        image: "/images/books-bg-optimized.webp",
        link: localePath("/bookshelf", lang)
      },
      {
        title: text.techStackTitle,
        description: text.techStackDescription,
        image: "/images/tech-bg-optimized.webp",
        link: localePath("/tech-stack", lang)
      }
    ];
  }

  static createInfoCardsFromACF(homepageData: HomepageSections | null, lang: Lang = DEFAULT_LANG): InfoCardData[] {
    if (!homepageData) return this.createStaticInfoCards(lang);
    const text = HOME_DEFAULTS[lang];

    const cards: InfoCardData[] = [];

    // Add bookshelf card if data exists
    if (homepageData.bookshelfSection) {
      cards.push({
        title: homepageData.bookshelfSection.title || text.bookshelfTitle,
        description: homepageData.bookshelfSection.description || text.bookshelfDescription,
        image: homepageData.bookshelfSection.featuredImage?.node?.sourceUrl || "/images/books-bg.png",
        link: localePath("/bookshelf", lang)
      });
    }

    // Add tech stack card if data exists
    if (homepageData.techstackSection) {
      cards.push({
        title: homepageData.techstackSection.title || text.techStackTitle,
        description: homepageData.techstackSection.description || text.techStackDescription,
        image: homepageData.techstackSection.featuredImage?.node?.sourceUrl || "/images/tech-bg.png",
        link: localePath("/tech-stack", lang)
      });
    }

    // Return static cards if no ACF data found
    return cards.length > 0 ? cards : this.createStaticInfoCards(lang);
  }
}

// Section factory for creating homepage sections
export class SectionFactory {
  static createHomepageSections(
    homepageData: HomepageSections | null,
    projectsData: unknown,
    postsData: unknown,
    lang: Lang = DEFAULT_LANG
  ): SectionConfig[] {
    const text = HOME_DEFAULTS[lang];
    // Projects appear only as the hero strip (design H9); the separate homepage
    // projects section was removed 2026-10-12 because it repeated the same work.
    const projectNodes = (projectsData as any)?.projects?.nodes || [];
    
    const postNodes = (postsData as any)?.posts?.nodes || [];
    const transformedPosts = SectionTransformers.transformPosts(postNodes, lang);

    return [
      createSectionConfig('hero', 'hero', {
        data: homepageData?.heroSection,
        frames: buildHeroFrames(projectNodes, lang),
        copyLinks: buildHeroCopyLinks(projectNodes),
        lang
      }, 1),

      // Testimonials sit right after the hero, which now holds the projects.
      createSectionConfig('testimonials', 'testimonials', {
        data: homepageData?.testimonialsSection
      }, 2),

      createSectionConfig('about', 'about', {
        data: homepageData?.aboutSection,
        lang
      }, 3),

      createSectionConfig('info-cards', 'infocards', {
        skin: 'default',
        variant: 'dark',
        columns: 2,
        cards: SectionTransformers.createInfoCardsFromACF(homepageData, lang),
        lang
      }, 4),

      createSectionConfig('notebook', 'infocards', {
        skin: 'blog',
        variant: 'light',
        sectionNumber: '03',
        sectionTitle: homepageData?.notebookSection?.title || text.notebookTitle,
        columns: 3,
        cards: transformedPosts,
        viewMoreLink: localePath(cmsText(homepageData?.notebookSection?.viewAllUrl, '/notebook'), lang),
        viewMoreText: cmsText(homepageData?.notebookSection?.viewAllLabel, text.notebookViewAll),
        lang
      }, 5),

      createSectionConfig('contact', 'contact', {
        data: homepageData?.contactSection,
        lang
      }, 6)
    ].filter(section => section.enabled);
  }
}