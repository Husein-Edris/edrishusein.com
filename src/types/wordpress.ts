import type { TestimonialsSection } from '@/src/lib/transform/transformTestimonials';
// Core WordPress types matching GraphQL schema

export interface WordPressImage {
  node: {
    sourceUrl: string;
    altText: string;
    mediaDetails: {
      height: number;
      width: number;
    };
  };
}

export interface WordPressButton {
  url: string;
  title: string;
  target?: string;
}

export interface WordPressProject {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: WordPressImage;
  /** ACF true_false `highlighted`: feature this project on /projects. */
  highlighted?: boolean;
  /** Project facts `built_at` (e.g. Freelance); '' when empty. */
  builtAt?: string;
  /** Project facts `showcase_video` file URL for the homepage hero; '' when empty. */
  showcaseVideo?: string;
  caseStudy?: {
    projectLinks?: {
      liveSite?: string;
      github?: string;
    };
    projectOverview?: {
      technologies?: Array<{
        id: string;
        title: string;
        featuredImage?: WordPressImage;
      }>;
    };
    projectContent?: {
      challenge?: string;
      solution?: string;
      keyFeatures?: Array<{
        title: string;
        description: string;
        image?: {
          sourceUrl: string;
          altText: string;
        };
      }>;
    };
    projectGallery?: Array<{
      sourceUrl: string;
      altText: string;
      mediaDetails: {
        width: number;
        height: number;
      };
    }>;
  };
}

// ACF Image type (GraphQL structure)
export interface ACFImage {
  node: {
    sourceUrl: string;
    altText: string;
    mediaDetails: {
      height: number;
      width: number;
    };
  };
}

// Section-specific types matching ACF structure
export interface HeroSection {
  title?: string;
  heroCopy?: string;
  heroImage?: ACFImage;
  /** Visible copy; empty means the Hero component's built-in default renders. */
  eyebrow?: string;
  heading?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
}

export interface ProjectsSection {
  title?: string;
  /** "View all" link next to the homepage section title; empty means the code default renders. */
  viewAllLabel?: string;
  viewAllUrl?: string;
}

export interface AboutSection {
  title?: string;
  aboutMeText?: string;
  /** "Learn more about me" button; empty means the code default renders. */
  learnMoreLabel?: string;
  learnMoreUrl?: string;
}

export interface BookshelfSection {
  title?: string;
  description?: string;
  featuredImage?: ACFImage;
}

export interface TechStackSection {
  title?: string;
  description?: string;
  featuredImage?: ACFImage;
}

export interface NotebookSection {
  title?: string;
  /** "View all" link next to the homepage section title; empty means the code default renders. */
  viewAllLabel?: string;
  viewAllUrl?: string;
}

export interface ContactSection {
  subTitle?: string;
  title?: string;
  email?: string;
}

export interface HomepageSections {
  heroSection?: HeroSection;
  projectsSection?: ProjectsSection;
  aboutSection?: AboutSection;
  bookshelfSection?: BookshelfSection;
  techstackSection?: TechStackSection;
  notebookSection?: NotebookSection;
  contactSection?: ContactSection;
  // Set by DataFetcher.getHomepageData() from the same home page REST response.
  testimonialsSection?: TestimonialsSection;
}

export interface ProjectsResponse {
  projects: {
    nodes: WordPressProject[];
  };
}

export interface HomepageResponse {
  page: {
    homepageSections: HomepageSections;
  };
}

// Transformed types for components
export interface TransformedProject {
  title: string;
  description: string;
  image?: string;
  variant: 'dark' | 'light';
  visitLink: string;
  caseStudyLink: string;
}

export interface InfoCardData {
  title: string;
  description: string;
  image?: string;
  link?: string;
  visitLink?: string;
  caseStudyLink?: string;
}